"use client";

import { useState, useEffect } from "react";
import { User, useAuth } from "@/hooks/auth";
import { Search, Trash2, Check, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const { users, addUser, deleteUser, currentUser, fetchUsers } = useAuth();
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("Vendeur (Accès limité)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedAccess, setGeneratedAccess] = useState<{name: string, identifier: string, pin: string} | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateRandomPin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const generateIdentifier = (name: string) => {
    const base = name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    return `${base}${randomSuffix}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Veuillez renseigner le nom.");
      return;
    }

    const pin = generateRandomPin();
    const identifier = generateIdentifier(formName);
    const canViewDashboard = formRole === "Gérant (Accès complet)";

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formName.trim(),
      identifier: identifier,
      pinCode: pin,
      role: "employee",
      permissions: {
        canViewDashboard: canViewDashboard
      },
      createdAt: new Date().toISOString()
    };

    setIsSubmitting(true);
    try {
      await addUser(newUser);
      setGeneratedAccess({ name: newUser.name, identifier, pin });
      setFormName("");
    } catch (error: any) {
      alert(error.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
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

  const handleShare = async (user: {name: string, identifier: string, pinCode?: string, pin?: string}) => {
    const loginUrl = `${window.location.origin}/employe/${currentUser?.shopSlug}/login`;
    const message = `Bonjour ${user.name},\n\nVoici tes accès pour l'espace vendeur StockHub :\n\nLien de connexion : ${loginUrl}\nIdentifiant : ${user.identifier}\nCode PIN : ${user.pinCode || user.pin}\n\nNe partage pas ces informations.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Accès StockHub",
          text: message,
        });
        return;
      } catch (err) {
        console.error("Partage natif annulé ou échoué", err);
      }
    }
    
    navigator.clipboard.writeText(message).then(() => {
      alert("Les accès ont été copiés dans le presse-papier ! Vous pouvez les coller dans un message.");
    }).catch(err => {
      alert("Erreur lors de la copie. Voici les informations :\n" + message);
    });
  };

  return (
    <div className="p-3 md:p-0 max-w-5xl mx-auto space-y-8 relative pb-20 animate-in fade-in duration-300">
      {/* HEADER SECTION */}
      <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-[#0b213f]/10 flex items-center justify-center shrink-0">
          <Users className="text-[#0b213f] w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Équipe</h1>
          <p className="text-slate-500 text-sm mt-1">Génère des accès pour tes collègues pour gérer Stockhub avec toi.</p>
        </div>
      </div>

      {/* INVITATION FORM */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4 relative">
          <div className="w-full flex-1 group">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Nom de l'employé</label>
            <input 
              type="text" 
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ex: Alice"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0b213f]/20 focus:border-[#0b213f] outline-none transition-all text-sm shadow-sm hover:border-[#0b213f]/50"
              required
            />
          </div>
          <div className="w-full md:w-64 shrink-0">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Rôle</label>
            <div className="relative">
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0b213f]/20 focus:border-[#0b213f] outline-none transition-all text-sm shadow-sm cursor-pointer appearance-none hover:border-[#0b213f]/50"
              >
                <option>Vendeur (Accès limité)</option>
                <option>Gérant (Accès complet)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto bg-[#0b213f] hover:bg-[#18355c] text-white font-medium px-8 py-6 rounded-xl transition-all shadow-md shadow-[#0b213f]/20"
          >
            {isSubmitting ? "Génération..." : "Générer"}
          </Button>
        </form>

        {generatedAccess && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Check className="text-emerald-500 w-5 h-5" />
              </div>
              <div>
                <p className="text-emerald-900 font-semibold text-sm">Accès généré pour {generatedAccess.name} !</p>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <p className="text-emerald-700 text-sm">ID: <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-800">{generatedAccess.identifier}</span></p>
                  <p className="text-emerald-700 text-sm">PIN: <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-800 tracking-wider">{generatedAccess.pin}</span></p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  const loginUrl = `${window.location.origin}/employe/${currentUser?.shopSlug}/login`;
                  navigator.clipboard.writeText(loginUrl);
                  alert("Lien de connexion copié dans le presse-papier !");
                }} 
                className="bg-white hover:bg-slate-50 text-emerald-700 border-emerald-200 shrink-0 rounded-lg text-sm px-4 shadow-sm"
              >
                Copier
              </Button>
              <Button 
                type="button"
                onClick={() => handleShare(generatedAccess)} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 rounded-lg text-sm px-4 shadow-sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* MEMBERS LIST */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Membres de l'équipe</h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Rechercher par nom..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0b213f]/20 focus:border-[#0b213f] transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-transparent hidden md:table-header-group">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="text-xs font-bold text-slate-400 tracking-wider uppercase h-12 pl-6">Membre</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 tracking-wider uppercase h-12 text-right">Rôle</TableHead>
                <TableHead className="w-24 text-right pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-slate-500 text-sm">
                    Aucun membre trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group flex flex-col md:table-row">
                    <TableCell className="py-4 pl-6 flex-1 border-b md:border-b-0 border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-[#0b213f] text-white flex items-center justify-center font-bold shrink-0 text-lg shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.name}</div>
                          <div className="text-slate-500 text-xs font-mono mt-0.5 opacity-80 flex gap-3">
                            <span>ID: {user.identifier}</span>
                            <span>PIN: {user.pinCode}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-left md:text-right py-3 md:py-4 pl-6 md:pl-0 border-b md:border-b-0 border-slate-100">
                      <Badge className={
                        user.role === "owner" 
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200 font-semibold border-0 px-3 py-1" 
                          : user.permissions.canViewDashboard 
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold border-0 px-3 py-1"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold border-0 px-3 py-1"
                      }>
                        {user.role === "owner" ? "Propriétaire" : user.permissions.canViewDashboard ? "Gérant" : "Vendeur"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 md:py-4 pr-6 pl-6 md:pl-0 text-right">
                      {user.role !== "owner" && user.id !== currentUser?.id && (
                        <div className="flex justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              const loginUrl = `${window.location.origin}/employe/${currentUser?.shopSlug}/login`;
                              navigator.clipboard.writeText(loginUrl);
                              alert("Lien de connexion copié !");
                            }}
                            className="text-slate-400 hover:text-[#0b213f] hover:bg-[#0b213f]/10 h-8 w-8 rounded-full" 
                            title="Copier les accès"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleShare(user)} className="text-slate-400 hover:text-[#0b213f] hover:bg-[#0b213f]/10 h-8 w-8 rounded-full" title="Partager">
                            <Share2 size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(user.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-full" title="Supprimer">
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
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer l'accès"
        message="Êtes-vous sûr de vouloir révoquer l'accès de ce membre ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
}
