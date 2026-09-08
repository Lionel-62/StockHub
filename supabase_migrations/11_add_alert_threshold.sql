-- Add alert_threshold column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS alert_threshold INTEGER DEFAULT 5;
