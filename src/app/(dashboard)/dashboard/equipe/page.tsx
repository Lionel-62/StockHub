"use client";

import { useState } from "react";
import { User, useAuth } from "@/lib/mock/auth";
import { Plus, Search, Trash2, KeyRound, ShieldAlert, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function EquipePage() {
  const { users, addUser, deleteUser, currentUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    identifier: "",
    pinCode: "",
    canViewDashboard: false
  });

  // Only owners should ideally access this, but auth-guard handles it.
  
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.identifier || form.pinCode.length !== 4) {
      alert("Veuillez remplir tous les champs correctement (Code PIN à 4 chiffres).");
      return;
    }

    // Check if identifier already exists
    if (users.some(u => u.identifier.toLowerCase() === form.identifier.toLowerCase())) {
      alert("Cet identifiant est déjà utilisé.");
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: form.name,
      identifier: form.identifier,
      pinCode: form.pinCode,
      role: "employee", // Only employees are created here
      permissions: {
        canViewDashboard: form.canViewDashboard
      },
      createdAt: new Date().toISOString()
    };

    addUser(newUser);
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setForm({ name: "", identifier: "", pinCode: "", canViewDashboard: false });
    setIsModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setUserToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleShare = (user: User) => {
    const loginUrl = `${window.location.origin}/employe/login`;
    const message = `Bonjour ${user.name},\n\nVoici tes accès pour l'espace vendeur StockHub :\n\nLien de connexion : ${loginUrl}\nIdentifiant : ${user.identifier}\nCode PIN : ${user.pinCode}\n\nNe partage pas ces informations.`;
    
    navigator.clipboard.writeText(message).then(() => {
      alert("Les accès ont été copiés dans le presse-papier ! Vous pouvez maintenant les coller dans un message pour l'envoyer à votre employé.");
    }).catch(err => {
      alert("Erreur lors de la copie. Voici les informations :\n" + message);
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Équipe</h1>
          <p className="text-slate-500 mt-1">Gérez les accès de vos employés au système.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un employé..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0b213f] transition-all"
            />
          </div>
          <Button onClick={openAddModal} className="bg-[#0b213f] hover:bg-[#18355c] text-white shrink-0">
            <Plus size={16} className="mr-2" />
            Nouvel employé
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Employé</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Identifiant (Login)</TableHead>
              <TableHead>Accès Tableau de bord</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0 border border-slate-200">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-medium text-slate-900">{user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.role === "owner" ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : "bg-blue-100 text-blue-700 hover:bg-blue-100"}>
                      {user.role === "owner" ? "Propriétaire" : "Employé"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded text-sm">
                      {user.identifier}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.permissions.canViewDashboard ? (
                      <span className="flex items-center text-green-600 text-sm font-medium">
                        <Check size={16} className="mr-1" /> Autorisé
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm">Refusé</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role !== "owner" && user.id !== currentUser?.id && (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleShare(user)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50" title="Partager les accès">
                          <Share2 size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => confirmDelete(user.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50" title="Supprimer l'employé">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal d'ajout d'employé */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg">Nouveau profil employé</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Trash2 size={20} className="hidden" /> {/* Placeholder */}
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nom complet</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0b213f] focus:border-[#0b213f] outline-none"
                  placeholder="Ex: Alice Dupont"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Identifiant de connexion</label>
                <input 
                  type="text" 
                  value={form.identifier}
                  onChange={e => setForm({...form, identifier: e.target.value.toLowerCase().replace(/\s/g, '')})}
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0b213f] focus:border-[#0b213f] outline-none font-mono"
                  placeholder="Ex: alice"
                  required
                />
                <p className="text-xs text-slate-500">L'employé utilisera cet identifiant pour se connecter.</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Code PIN (4 chiffres)</label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={form.pinCode}
                    onChange={e => setForm({...form, pinCode: e.target.value.replace(/[^0-9]/g, '').slice(0, 4)})}
                    className="w-full pl-9 p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0b213f] focus:border-[#0b213f] outline-none tracking-widest font-mono"
                    placeholder="1234"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={form.canViewDashboard}
                    onChange={e => setForm({...form, canViewDashboard: e.target.checked})}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0b213f] focus:ring-[#0b213f]"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Autoriser l'accès au Tableau de bord</p>
                    <p className="text-xs text-slate-500 mt-0.5">Permet à l'employé de voir les statistiques financières globales (CA, Ventes, etc).</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-[#0b213f] hover:bg-[#18355c] text-white">Créer le profil</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer cet employé ?"
        description="Cette action est irréversible. L'employé ne pourra plus se connecter au système."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
}
