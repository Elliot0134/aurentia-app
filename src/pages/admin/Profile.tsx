import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  Star,
  Plus,
  Zap,
  FileText,
  Users,
  TrendingUp,
  ChevronDown,
  SlidersHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

const Profile = () => {
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: ''
  });

  const handleSubmitRequest = () => {
    console.log('Demande soumise:', formData);
    setDialogOpen(false);
    setFormData({ type: '', title: '', description: '' });
  };

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
        {/* En-tête avec titre, sous-titre et boutons */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Profil Administrateur</h1>
              <p className="text-gray-600 text-base">
                Gérez votre profil d'administrateur.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="bg-white border border-gray-200 hover:bg-gray-50">
                En savoir +
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                    Ajouter +
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nouvelle demande de fonctionnalité</DialogTitle>
                    <DialogDescription>
                      En fait, on part de votre demande. Nous nous efforçons d'ajouter les nouvelles fonctionnalités dans les plus brefs délais suite aux demandes de nos utilisateurs.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Type de fonctionnalité</label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="outil">Nouvel outil</SelectItem>
                          <SelectItem value="ressource">Nouvelle ressource</SelectItem>
                          <SelectItem value="automation">Nouvelle automatisation</SelectItem>
                          <SelectItem value="partenaire">Nouveau partenaire</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Titre de la demande</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Ex: Outil de génération de contenu social media"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description détaillée</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Décrivez en détail votre demande..."
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSubmitRequest} style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                      Soumettre la demande
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
