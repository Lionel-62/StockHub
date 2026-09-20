import { addProductAction, updateProductAction, deleteProductAction } from "@/app/actions/products.actions";

export type SyncActionType = 'ADD_PRODUCT' | 'UPDATE_PRODUCT' | 'DELETE_PRODUCT';

export interface SyncAction {
  id: string; // unique ID for the action
  type: SyncActionType;
  payload: any;
  timestamp: string;
  retryCount: number;
}

const SYNC_QUEUE_KEY = 'stockhub_sync_queue';

class SyncManager {
  private queue: SyncAction[] = [];
  private isProcessing = false;
  private listeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadQueue();
      // Listen for online event to automatically trigger processing
      window.addEventListener('online', () => {
        this.processQueue();
      });
    }
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(SYNC_QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (e) {
      console.error("Error loading sync queue", e);
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (e) {
      console.error("Error saving sync queue", e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  public getQueueCount(): number {
    return this.queue.length;
  }

  public getQueue(): SyncAction[] {
    return [...this.queue];
  }

  public addToQueue(type: SyncActionType, payload: any) {
    const action: SyncAction = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    
    this.queue.push(action);
    this.saveQueue();
    
    // Attempt to process immediately (if we just had a micro-disconnect)
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  public removeFromQueue(actionId: string) {
    this.queue = this.queue.filter(a => a.id !== actionId);
    this.saveQueue();
  }

  public async processQueue() {
    if (this.isProcessing || this.queue.length === 0 || !navigator.onLine) return;
    
    this.isProcessing = true;
    
    // Create a copy of the queue to process
    const currentQueue = [...this.queue];
    
    for (const action of currentQueue) {
      if (!navigator.onLine) break; // Stop if offline again
      
      let success = false;
      
      try {
        switch (action.type) {
          case 'ADD_PRODUCT': {
            const result = await addProductAction(action.payload);
            success = result.success;
            break;
          }
          case 'UPDATE_PRODUCT': {
            const result = await updateProductAction(action.payload.id, action.payload.data);
            success = result.success;
            break;
          }
          case 'DELETE_PRODUCT': {
            const result = await deleteProductAction(action.payload.id);
            success = result.success;
            break;
          }
          // Add other entity actions here in the future
        }
      } catch (error) {
        console.error(`Error processing sync action ${action.id}:`, error);
        success = false;
      }
      
      if (success) {
        // Success: remove from queue
        this.removeFromQueue(action.id);
      } else {
        // Failed: increment retry count
        const idx = this.queue.findIndex(a => a.id === action.id);
        if (idx !== -1) {
          this.queue[idx].retryCount += 1;
          // If it failed more than 10 times, maybe we should alert the user or drop it,
          // for now we keep trying.
          this.saveQueue();
        }
      }
    }
    
    this.isProcessing = false;
  }
}

// Singleton instance
export const syncManager = new SyncManager();
