# Prompt d'implémentation : Back-Office Admin

## Context
Aurentia est une plateforme multi-tenant avec React + TypeScript + Supabase. Nous devons créer un back-office administrateur pour gérer la plateforme, incluant la création d'outils IA, la gestion des utilisateurs, et l'accès aux données de tous les utilisateurs.

## Objectif
Créer une section admin complète accessible uniquement aux utilisateurs ayant le rôle `admin` dans la colonne `user_role` de la table `profiles`.

---

## ÉTAPE 1 : Configuration du rôle et des routes

### 1.1 Types déjà mis à jour ✅
- Le type `UserRole` dans `/src/types/userTypes.ts` inclut déjà `'admin'`
- Le rôle admin a accès complet à toutes les données de tous les utilisateurs

### 1.2 Créer le guard pour les routes admin
**Fichier** : `/src/components/admin/AdminRouteGuard.tsx`

```tsx
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  const { userRole, loading } = useUserRole();

  if (loading) {
    return <LoadingSpinner message="Vérification des permissions..." fullScreen />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/individual/dashboard" replace />;
  }

  return <>{children}</>;
};
```

### 1.3 Mettre à jour RoleBasedRedirect
**Fichier** : `/src/components/RoleBasedRedirect.tsx`

Ajouter dans le switch statement :
```tsx
case 'admin':
  return '/admin/dashboard';
```

Ajouter dans la whitelist :
```tsx
currentPath.startsWith('/admin') ||
```

### 1.4 Mettre à jour la sidebar pour afficher le lien admin
**Fichier** : `/src/components/RoleBasedSidebar.tsx`

Ajouter dans le switch de `getSidebarConfig()` :
```tsx
case 'admin':
  return {
    menuItems: [
      { name: "Dashboard Admin", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "Outils IA", path: "/admin/ai-tools", icon: <Bot size={20} /> },
      { name: "Utilisateurs", path: "/admin/users", icon: <Users size={20} /> },
      { name: "Organisations", path: "/admin/organizations", icon: <Building size={20} /> },
      { name: "Analytics", path: "/admin/analytics", icon: <BarChart3 size={20} /> },
      { name: "Crédits & Paiements", path: "/admin/credits", icon: <Coins size={20} /> },
      { name: "Contenu", path: "/admin/content", icon: <FileText size={20} /> },
      { name: "Paramètres", path: "/admin/settings", icon: <Settings size={20} /> },
    ],
    branding: { name: "Aurentia Admin", primaryColor: "#F04F6A" },
    showProjectSelector: false,
    showCredits: false
  };
```

**Important** : Ajouter aussi un lien "Accès Admin" dans les sidebars des autres rôles SI l'utilisateur a le rôle admin (vérifier avec un appel à useUserRole).

Exemple dans `getIndividualConfig()` :
```tsx
// Après les items normaux, ajouter conditionnellement :
...(userProfile?.user_role === 'admin' ? [
  { isDivider: true },
  { name: "🔧 Back-Office Admin", path: "/admin/dashboard", icon: <Shield size={20} />, isCustomAction: true }
] : [])
```

---

## ÉTAPE 2 : Services Admin

### 2.1 Service Admin général
**Fichier** : `/src/services/adminService.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';

export const adminService = {
  // Utilisateurs
  async getAllUsers(page = 0, limit = 50) {
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*, organization:organisations(*)', { count: 'exact' })
      .range(page * limit, (page + 1) * limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { users: data, total: count };
  },

  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, organization:organisations(*)')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async getUserProjects(userId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserCredits(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('monthly_credits_limit, monthly_credits_remaining, purchased_credits_remaining')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserCredits(userId: string, credits: {
    monthly_credits_limit?: number;
    monthly_credits_remaining?: number;
    purchased_credits_remaining?: number;
  }) {
    const { error } = await supabase
      .from('profiles')
      .update(credits)
      .eq('id', userId);

    if (error) throw error;
  },

  // Organisations
  async getAllOrganizations() {
    const { data, error } = await supabase
      .from('organisations')
      .select('*, members:user_organizations(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Analytics globales
  async getGlobalStats() {
    const [usersCount, projectsCount, orgsCount] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('organisations').select('*', { count: 'exact', head: true })
    ]);

    return {
      totalUsers: usersCount.count || 0,
      totalProjects: projectsCount.count || 0,
      totalOrganizations: orgsCount.count || 0
    };
  }
};
```

### 2.2 Service AI Tools Admin
**Fichier** : `/src/services/adminAIToolsService.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';

export interface AIToolCreate {
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  category: string;
  icon_url?: string;
  webhook_url: string;
  credits_cost: number;
  is_published: boolean;
  usage_instructions?: string;
  expected_output?: string;
  input_schema?: Record<string, any>;
  settings_schema?: Record<string, any>;
}

export const adminAIToolsService = {
  async getAllTools(includeInactive = true) {
    let query = supabase
      .from('ai_tools')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getToolById(id: string) {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createTool(tool: AIToolCreate) {
    const { data, error } = await supabase
      .from('ai_tools')
      .insert({
        ...tool,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTool(id: string, updates: Partial<AIToolCreate>) {
    const { data, error } = await supabase
      .from('ai_tools')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTool(id: string) {
    // Soft delete - désactiver l'outil
    const { error } = await supabase
      .from('ai_tools')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  async uploadIcon(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `ai-tools-icons/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('public')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async getToolUsageStats(toolId: string) {
    const { data, error } = await supabase
      .from('ai_tool_usage_history')
      .select('status, credits_used, created_at')
      .eq('tool_id', toolId);

    if (error) throw error;

    return {
      totalUsage: data.length,
      totalCreditsUsed: data.reduce((sum, item) => sum + (item.credits_used || 0), 0),
      successRate: data.filter(item => item.status === 'completed').length / data.length * 100
    };
  }
};
```

---

## ÉTAPE 3 : Pages Admin

### 3.1 Layout Admin
**Fichier** : `/src/pages/admin/AdminLayout.tsx`

```tsx
import { Outlet } from 'react-router-dom';
import { AdminRouteGuard } from '@/components/admin/AdminRouteGuard';

export const AdminLayout = () => {
  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
    </AdminRouteGuard>
  );
};
```

### 3.2 Dashboard Admin
**Fichier** : `/src/pages/admin/AdminDashboard.tsx`

```tsx
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, FileText, Zap } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getGlobalStats()
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard Administrateur</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building size={20} />
              Organisations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalOrganizations}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Projets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalProjects}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={20} />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <a href="/admin/ai-tools/new" className="text-sm text-aurentia-pink hover:underline">
                + Créer un outil IA
              </a>
              <a href="/admin/users" className="text-sm text-aurentia-pink hover:underline">
                Gérer les utilisateurs
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
```

### 3.3 Gestionnaire d'outils IA
**Fichier** : `/src/pages/admin/AIToolsManager.tsx`

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAIToolsService } from '@/services/adminAIToolsService';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const AIToolsManager = () => {
  const [includeInactive, setIncludeInactive] = useState(false);

  const { data: tools, isLoading, refetch } = useQuery({
    queryKey: ['admin-ai-tools', includeInactive],
    queryFn: () => adminAIToolsService.getAllTools(includeInactive)
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestion des Outils IA</h1>
        <Link to="/admin/ai-tools/new">
          <Button className="bg-aurentia-pink hover:bg-aurentia-pink/90">
            <Plus size={16} className="mr-2" />
            Nouvel outil
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="rounded"
          />
          <span>Afficher les outils inactifs</span>
        </label>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Coût (crédits)</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tools?.map((tool) => (
            <TableRow key={tool.id}>
              <TableCell className="font-medium">{tool.title}</TableCell>
              <TableCell>{tool.category}</TableCell>
              <TableCell>{tool.credits_cost}</TableCell>
              <TableCell>
                <Badge variant={tool.is_published ? 'default' : 'secondary'}>
                  {tool.is_published ? 'Publié' : 'Brouillon'}
                </Badge>
                {!tool.is_active && (
                  <Badge variant="destructive" className="ml-2">Inactif</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link to={`/admin/ai-tools/${tool.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit size={14} />
                    </Button>
                  </Link>
                  <Link to={`/individual/outils/${tool.slug}/${tool.id}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <Eye size={14} />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

### 3.4 Formulaire de création/édition d'outil IA
**Fichier** : `/src/pages/admin/AIToolForm.tsx`

```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminAIToolsService } from '@/services/adminAIToolsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const AIToolForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    long_description: '',
    category: '',
    icon_url: '',
    webhook_url: '',
    credits_cost: 1,
    is_published: false,
    usage_instructions: '',
    expected_output: ''
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Charger l'outil existant si en mode édition
  const { data: existingTool, isLoading: loadingTool } = useQuery({
    queryKey: ['admin-ai-tool', id],
    queryFn: () => adminAIToolsService.getToolById(id!),
    enabled: isEditMode
  });

  useEffect(() => {
    if (existingTool) {
      setFormData({
        title: existingTool.title || '',
        slug: existingTool.slug || '',
        description: existingTool.description || '',
        long_description: existingTool.long_description || '',
        category: existingTool.category || '',
        icon_url: existingTool.icon_url || '',
        webhook_url: existingTool.webhook_url || '',
        credits_cost: existingTool.credits_cost || 1,
        is_published: existingTool.is_published || false,
        usage_instructions: existingTool.usage_instructions || '',
        expected_output: existingTool.expected_output || ''
      });
    }
  }, [existingTool]);

  // Mutation pour créer/mettre à jour
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Upload icon si présent
      let iconUrl = formData.icon_url;
      if (iconFile) {
        setUploading(true);
        iconUrl = await adminAIToolsService.uploadIcon(iconFile);
        setUploading(false);
      }

      const dataToSave = { ...formData, icon_url: iconUrl };

      if (isEditMode) {
        return adminAIToolsService.updateTool(id!, dataToSave);
      } else {
        return adminAIToolsService.createTool(dataToSave);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: `Outil ${isEditMode ? 'mis à jour' : 'créé'} avec succès !`
      });
      navigate('/admin/ai-tools');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIconFile(e.target.files[0]);
    }
  };

  // Auto-générer le slug depuis le titre
  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: prev.slug || value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }));
  };

  if (isEditMode && loadingTool) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">
        {isEditMode ? 'Modifier l\'outil IA' : 'Créer un nouvel outil IA'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Catégorie *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="ex: Marketing, SEO, Rédaction..."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description courte *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="long_description">Description détaillée</Label>
              <Textarea
                id="long_description"
                value={formData.long_description}
                onChange={(e) => setFormData(prev => ({ ...prev, long_description: e.target.value }))}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration technique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhook_url">URL du Webhook N8N *</Label>
              <Input
                id="webhook_url"
                type="url"
                value={formData.webhook_url}
                onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                placeholder="https://n8n.srv906204.hstgr.cloud/webhook/..."
                required
              />
            </div>

            <div>
              <Label htmlFor="credits_cost">Coût en crédits *</Label>
              <Input
                id="credits_cost"
                type="number"
                min="0"
                value={formData.credits_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, credits_cost: parseInt(e.target.value) }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="icon">Icône de l'outil</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="icon"
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className="flex-1"
                />
                {formData.icon_url && (
                  <img src={formData.icon_url} alt="Preview" className="h-12 w-12 rounded object-cover" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions d'utilisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="usage_instructions">Comment utiliser cet outil ?</Label>
              <Textarea
                id="usage_instructions"
                value={formData.usage_instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, usage_instructions: e.target.value }))}
                rows={4}
                placeholder="Expliquez aux utilisateurs comment utiliser cet outil..."
              />
            </div>

            <div>
              <Label htmlFor="expected_output">Résultat attendu</Label>
              <Textarea
                id="expected_output"
                value={formData.expected_output}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_output: e.target.value }))}
                rows={3}
                placeholder="Décrivez ce que l'outil va produire..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
              />
              <Label>Publier cet outil (visible par tous les utilisateurs)</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/ai-tools')}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={saveMutation.isPending || uploading}
            className="bg-aurentia-pink hover:bg-aurentia-pink/90"
          >
            {saveMutation.isPending || uploading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
};
```

### 3.5 Gestion des utilisateurs
**Fichier** : `/src/pages/admin/UsersManager.tsx`

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const UsersManager = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => adminService.getAllUsers(page)
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  const filteredUsers = data?.users?.filter(user =>
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Gestion des Utilisateurs</h1>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Rechercher par email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Organisation</TableHead>
            <TableHead>Crédits</TableHead>
            <TableHead>Date création</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge>{user.user_role}</Badge>
              </TableCell>
              <TableCell>{user.organization?.name || '-'}</TableCell>
              <TableCell>
                {(user.monthly_credits_remaining || 0) + (user.purchased_credits_remaining || 0)} / {user.monthly_credits_limit || 0}
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Link to={`/admin/users/${user.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye size={14} />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Précédent
        </Button>
        <span>Page {page + 1}</span>
        <Button
          variant="outline"
          onClick={() => setPage(p => p + 1)}
          disabled={!data?.users || data.users.length < 50}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
};
```

---

## ÉTAPE 4 : Routes dans App.tsx

**Fichier** : `/src/App.tsx`

Ajouter les imports :
```tsx
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AIToolsManager } from './pages/admin/AIToolsManager';
import { AIToolForm } from './pages/admin/AIToolForm';
import { UsersManager } from './pages/admin/UsersManager';
```

Ajouter les routes dans la section `<RoleBasedLayout>` :
```tsx
{/* Admin routes */}
<Route path="/admin" element={<AdminLayout />}>
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="ai-tools" element={<AIToolsManager />} />
  <Route path="ai-tools/new" element={<AIToolForm />} />
  <Route path="ai-tools/:id" element={<AIToolForm />} />
  <Route path="users" element={<UsersManager />} />
  <Route path="users/:id" element={<div>User Detail - À créer</div>} />
  <Route path="organizations" element={<div>Organizations - À créer</div>} />
  <Route path="analytics" element={<div>Analytics - À créer</div>} />
  <Route path="credits" element={<div>Credits Management - À créer</div>} />
  <Route path="content" element={<div>Content Management - À créer</div>} />
  <Route path="settings" element={<div>Admin Settings - À créer</div>} />
</Route>
```

---

## ÉTAPE 5 : Types TypeScript

**Fichier** : `/src/types/aiTools.ts` (vérifier si existe, sinon créer)

```typescript
export interface AITool {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  category: string;
  icon_url?: string;
  webhook_url: string;
  credits_cost: number;
  is_active: boolean;
  is_published: boolean;
  usage_instructions?: string;
  expected_output?: string;
  input_schema?: Record<string, any>;
  settings_schema?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AIToolFavorite {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
}

export interface AIToolUsageHistory {
  id: string;
  user_id: string;
  tool_id: string;
  project_id?: string;
  input_data: Record<string, any>;
  output_data?: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  credits_used?: number;
  execution_time_ms?: number;
  created_at: string;
  completed_at?: string;
}

export interface AIToolUserSettings {
  id: string;
  user_id: string;
  tool_id: string;
  settings_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ToolExecutionRequest {
  toolId: string;
  inputData: Record<string, any>;
  projectId?: string;
  userSettings?: Record<string, any>;
}

export interface ToolExecutionResponse {
  success: boolean;
  data?: any;
  error?: string;
  executionId?: string;
}
```

---

## ÉTAPE 6 : Migration Supabase (si nécessaire)

**Vérifier que la table `ai_tools` existe avec la structure suivante :**

```sql
-- Si la table n'existe pas, la créer
CREATE TABLE IF NOT EXISTS public.ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  category TEXT NOT NULL,
  icon_url TEXT,
  webhook_url TEXT NOT NULL,
  credits_cost INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  usage_instructions TEXT,
  expected_output TEXT,
  input_schema JSONB,
  settings_schema JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;

-- Lecture : tous les utilisateurs authentifiés peuvent voir les outils publiés et actifs
CREATE POLICY "Anyone can view published active tools"
  ON public.ai_tools FOR SELECT
  USING (is_active = true AND is_published = true);

-- Admin : accès complet
CREATE POLICY "Admins have full access"
  ON public.ai_tools FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_ai_tools_slug ON public.ai_tools(slug);
CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON public.ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_ai_tools_published ON public.ai_tools(is_published, is_active);
```

---

## ÉTAPE 7 : Workflow avec MCP N8N

### 7.1 Instructions pour l'admin
Lorsqu'un admin crée un nouvel outil IA, il doit :

1. **Créer le workflow dans N8N** en utilisant le MCP N8N (si disponible)
2. **Récupérer l'URL du webhook** depuis N8N
3. **Remplir le formulaire** dans le back-office admin avec :
   - Titre, description, catégorie
   - URL du webhook N8N
   - Coût en crédits
   - Instructions d'utilisation
   - Résultat attendu
   - Icône (upload)
4. **Publier l'outil** en cochant "Publier"

### 7.2 Intégration avec Claude via Custom Instructions
L'admin peut avoir des custom instructions Claude spécialisées en création de workflows N8N :

```
Tu es un expert en création de workflows N8N.
Ton rôle est de créer des workflows d'automatisation et d'outils IA.
Tu as accès au serveur MCP N8N pour créer directement les workflows.

Workflow type pour un outil IA:
1. Webhook Trigger (POST)
2. Traitement des données (parse, validation)
3. Appel API externe (OpenAI, etc.)
4. Formatage de la réponse
5. Update Supabase (ai_tool_usage_history)
6. Webhook Response

Toujours inclure la gestion d'erreurs et les retry policies.
```

---

## ÉTAPE 8 : Checklist finale

### Fonctionnalités à implémenter (par ordre de priorité) :

1. ✅ **Routes et guards admin**
   - AdminRouteGuard
   - Routes /admin/*
   - Mise à jour RoleBasedRedirect

2. ✅ **Sidebar avec lien admin**
   - Ajouter case 'admin' dans RoleBasedSidebar
   - Lien conditionnel "Back-Office Admin" dans les autres sidebars

3. ✅ **Services**
   - adminService.ts (users, orgs, stats)
   - adminAIToolsService.ts (CRUD outils IA)

4. ✅ **Pages principales**
   - AdminDashboard (stats globales)
   - AIToolsManager (liste des outils)
   - AIToolForm (création/édition)
   - UsersManager (liste users)

5. 🔲 **Pages secondaires** (à créer plus tard)
   - UserDetail (détail d'un user avec projets, crédits)
   - OrganizationsManager
   - AdminAnalytics (graphiques)
   - CreditsManager (gestion des crédits tous users)
   - ContentManager (gestion du contenu éditorial)

6. 🔲 **Améliorations futures**
   - Système de logs d'actions admin
   - Recherche avancée (users, tools, orgs)
   - Export CSV des données
   - Dashboard analytics avec Chart.js
   - Notifications admin

---

## ÉTAPE 9 : Sécurité

### Row Level Security (RLS)
Assurez-vous que les policies Supabase autorisent les admins à accéder à TOUTES les données :

```sql
-- Exemple pour la table profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.user_role = 'admin'
    )
  );

-- Exemple pour la table projects
CREATE POLICY "Admins can view all projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );
```

### Frontend Guards
- `AdminRouteGuard` vérifie le rôle avant d'afficher les pages
- Redirection automatique si non-admin

---

## NOTES IMPORTANTES

1. **Ne pas créer de nouveau projet** : tout doit être intégré dans le projet actuel
2. **RLS Policies** : vérifier que les admins ont accès à toutes les tables nécessaires
3. **MCP N8N** : l'admin utilisera un custom instructions Claude pour créer les workflows N8N
4. **Icônes** : upload dans Supabase Storage bucket `public/ai-tools-icons/`
5. **Slug unique** : auto-généré depuis le titre, mais modifiable
6. **Soft delete** : les outils ne sont jamais supprimés, juste désactivés (`is_active: false`)

---

## RÉSUMÉ DES FICHIERS À CRÉER

```
src/
├── components/
│   └── admin/
│       └── AdminRouteGuard.tsx
├── services/
│   ├── adminService.ts
│   └── adminAIToolsService.ts
├── pages/
│   └── admin/
│       ├── AdminLayout.tsx
│       ├── AdminDashboard.tsx
│       ├── AIToolsManager.tsx
│       ├── AIToolForm.tsx
│       └── UsersManager.tsx
└── types/
    └── aiTools.ts (vérifier si existe)
```

### Fichiers à MODIFIER :
- `/src/types/userTypes.ts` ✅ (déjà fait)
- `/src/components/RoleBasedRedirect.tsx`
- `/src/components/RoleBasedSidebar.tsx`
- `/src/App.tsx`

---

## EXEMPLE DE WORKFLOW DE CRÉATION D'OUTIL IA

1. Admin ouvre `/admin/ai-tools/new`
2. Admin demande à Claude (avec custom instructions N8N) de créer le workflow
3. Claude crée le workflow via MCP N8N et retourne l'URL du webhook
4. Admin copie l'URL du webhook dans le formulaire
5. Admin remplit le reste (titre, description, coût, etc.)
6. Admin upload une icône
7. Admin coche "Publier" si prêt
8. Admin clique "Enregistrer"
9. L'outil apparaît sur `/individual/outils` pour tous les utilisateurs

---

Voilà ! Ce prompt détaillé couvre l'implémentation complète du back-office admin avec la gestion des outils IA. Suivez les étapes dans l'ordre pour une implémentation progressive et testable.
