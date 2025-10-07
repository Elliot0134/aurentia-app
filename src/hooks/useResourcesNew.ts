import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Resource, ResourceWithStats, ResourceFilters } from '@/types/resources';

// Simuler les appels API Supabase (à remplacer par de vrais appels)
const mockResources: ResourceWithStats[] = [
  {
    id: '1',
    name: 'Template Business Plan Complet',
    description: 'Un template Notion complet pour structurer votre business plan avec toutes les sections essentielles.',
    category: 'Business Plan',
    type: 'notion',
    price: 15,
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center',
    file_url: 'https://notion.so/template/business-plan',
    tags: ['Business Plan', 'Notion', 'Template', 'Stratégie'],
    difficulty: 'Intermédiaire',
    estimated_time: '2-3 heures',
    view_count: 245,
    download_count: 87,
    average_rating: 4.5,
    rating_count: 23,
    is_favorite: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Kit Identité Visuelle Canva',
    description: 'Pack complet de templates Canva pour créer une identité visuelle cohérente pour votre startup.',
    category: 'Design',
    type: 'canva',
    price: 25,
    image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop&crop=center',
    file_url: 'https://canva.com/design/template-id',
    tags: ['Design', 'Canva', 'Branding', 'Identité'],
    difficulty: 'Débutant',
    estimated_time: '1-2 heures',
    view_count: 189,
    download_count: 64,
    average_rating: 4.8,
    rating_count: 15,
    is_favorite: true,
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    name: 'Guide Marketing Digital PDF',
    description: 'Guide complet de 50 pages sur les stratégies de marketing digital pour les startups.',
    category: 'Marketing',
    type: 'pdf',
    price: 10,
    image_url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=400&fit=crop&crop=center',
    file_url: '/downloads/guide-marketing-digital.pdf',
    tags: ['Marketing', 'Digital', 'Guide', 'Stratégie'],
    difficulty: 'Avancé',
    estimated_time: '3-4 heures',
    view_count: 312,
    download_count: 156,
    average_rating: 4.2,
    rating_count: 41,
    is_favorite: false,
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-10T09:15:00Z'
  },
  {
    id: '4',
    name: 'Template Pitch Deck Investisseurs',
    description: 'Template professionnel pour créer un pitch deck qui impressionne les investisseurs.',
    category: 'Finance',
    type: 'template',
    price: 20,
    image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop&crop=center',
    file_url: '/downloads/template-pitch-deck.pptx',
    tags: ['Finance', 'Investissement', 'Présentation', 'Startup'],
    difficulty: 'Intermédiaire',
    estimated_time: '2-3 heures',
    view_count: 398,
    download_count: 142,
    average_rating: 4.7,
    rating_count: 28,
    is_favorite: false,
    created_at: '2024-01-25T16:45:00Z',
    updated_at: '2024-01-25T16:45:00Z'
  },
  {
    id: '5',
    name: 'Modèle de Statuts SASU',
    description: 'Template juridique complet pour créer les statuts de votre SASU avec toutes les clauses essentielles.',
    category: 'Juridique',
    type: 'pdf',
    price: 35,
    image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=400&fit=crop&crop=center',
    file_url: '/downloads/statuts-sasu-template.pdf',
    tags: ['Juridique', 'SASU', 'Statuts', 'Création'],
    difficulty: 'Avancé',
    estimated_time: '4-6 heures',
    view_count: 156,
    download_count: 89,
    average_rating: 4.3,
    rating_count: 12,
    is_favorite: false,
    created_at: '2024-01-30T11:20:00Z',
    updated_at: '2024-01-30T11:20:00Z'
  },
  {
    id: '6',
    name: 'Formation Vidéo - Comptabilité de Base',
    description: 'Série de vidéos pour comprendre les bases de la comptabilité d\'entreprise.',
    category: 'Formation',
    type: 'video',
    price: 45,
    image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop&crop=center',
    file_url: 'https://vimeo.com/formation-comptabilite',
    tags: ['Formation', 'Comptabilité', 'Vidéo', 'Finance'],
    difficulty: 'Débutant',
    estimated_time: '5-8 heures',
    view_count: 278,
    download_count: 103,
    average_rating: 4.6,
    rating_count: 34,
    is_favorite: false,
    created_at: '2024-02-05T09:30:00Z',
    updated_at: '2024-02-05T09:30:00Z'
  }
];

// Simuler un appel API avec délai
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchResources = async (filters: ResourceFilters = {}): Promise<ResourceWithStats[]> => {
  await delay(500); // Simuler un délai réseau
  
  let filtered = [...mockResources];
  
  // Appliquer les filtres
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(resource => 
      resource.name.toLowerCase().includes(search) ||
      resource.description.toLowerCase().includes(search) ||
      resource.tags.some(tag => tag.toLowerCase().includes(search))
    );
  }
  
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(resource => resource.category === filters.category);
  }
  
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(resource => resource.type === filters.type);
  }
  
  if (filters.difficulty && filters.difficulty !== 'all') {
    filtered = filtered.filter(resource => resource.difficulty === filters.difficulty);
  }
  
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(resource => 
      filters.tags!.some(tag => resource.tags.includes(tag))
    );
  }
  
  // Appliquer le tri
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      const order = filters.sortOrder === 'desc' ? -1 : 1;
      
      switch (filters.sortBy) {
        case 'recent':
          return order * (new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        case 'popular':
          return order * (b.download_count - a.download_count);
        case 'rating':
          return order * ((b.average_rating || 0) - (a.average_rating || 0));
        case 'name':
          return order * a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }
  
  return filtered;
};

const fetchResource = async (id: string): Promise<ResourceWithStats | null> => {
  await delay(300);
  return mockResources.find(r => r.id === id) || null;
};

const incrementViewCount = async (id: string): Promise<void> => {
  await delay(100);
  // En vrai, on appellerait Supabase ici
  const resource = mockResources.find(r => r.id === id);
  if (resource) {
    resource.view_count += 1;
  }
};

const incrementDownloadCount = async (id: string): Promise<void> => {
  await delay(100);
  // En vrai, on appellerait Supabase ici
  const resource = mockResources.find(r => r.id === id);
  if (resource) {
    resource.download_count += 1;
  }
};

const getUserIP = (): string => {
  // Simuler l'IP de l'utilisateur (en vrai on utiliserait un service)
  return 'user-ip-simulation';
};

export function useResources(filters: ResourceFilters = {}) {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: () => fetchResources(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useResource(id: string, incrementView = false) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['resource', id],
    queryFn: () => fetchResource(id),
    enabled: !!id,
  });
  
  // Incrémenter le compteur de vues
  const { mutate: incrementViews } = useMutation({
    mutationFn: () => incrementViewCount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource', id] });
    },
  });
  
  // Incrémenter automatiquement les vues si demandé
  if (incrementView && query.data && !query.isLoading) {
    incrementViews();
  }
  
  return query;
}

export function useResourceDownload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, fileUrl }: { id: string; fileUrl: string }) => {
      await incrementDownloadCount(id);
      // Ouvrir le lien de téléchargement
      window.open(fileUrl, '_blank');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

// Hook pour gérer les favoris (basé sur l'IP)
export function useFavorites() {
  const queryClient = useQueryClient();
  const userIP = getUserIP();
  
  // Récupérer les favoris depuis le localStorage
  const getFavorites = (): string[] => {
    try {
      const favorites = localStorage.getItem(`aurentia_favorites_${userIP}`);
      return favorites ? JSON.parse(favorites) : [];
    } catch {
      return [];
    }
  };
  
  // Sauvegarder les favoris dans le localStorage
  const saveFavorites = (favorites: string[]) => {
    localStorage.setItem(`aurentia_favorites_${userIP}`, JSON.stringify(favorites));
  };
  
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      const favorites = getFavorites();
      const isFavorite = favorites.includes(resourceId);
      
      if (isFavorite) {
        const newFavorites = favorites.filter(id => id !== resourceId);
        saveFavorites(newFavorites);
        return { resourceId, isFavorite: false };
      } else {
        const newFavorites = [...favorites, resourceId];
        saveFavorites(newFavorites);
        return { resourceId, isFavorite: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
  
  const isFavorite = (resourceId: string): boolean => {
    return getFavorites().includes(resourceId);
  };
  
  return {
    toggleFavorite: toggleFavoriteMutation.mutate,
    isFavorite,
    isLoading: toggleFavoriteMutation.isPending,
  };
}