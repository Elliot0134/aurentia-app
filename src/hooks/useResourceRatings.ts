import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ResourceRating } from '@/types/resources';

// Données simulées pour les ratings
const mockRatings: ResourceRating[] = [
  {
    id: '1',
    resource_id: '1',
    user_ip: 'user-ip-1',
    rating: 5,
    comment: 'Excellente ressource, très utile pour structurer mon business plan !',
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    resource_id: '1',
    user_ip: 'user-ip-2',
    rating: 4,
    comment: 'Bon template, quelques améliorations possibles.',
    created_at: '2024-01-22T14:30:00Z'
  },
  {
    id: '3',
    resource_id: '2',
    user_ip: 'user-ip-3',
    rating: 5,
    comment: 'Design parfait, très professionnel !',
    created_at: '2024-01-25T09:15:00Z'
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchResourceRatings = async (resourceId: string): Promise<ResourceRating[]> => {
  await delay(300);
  return mockRatings.filter(rating => rating.resource_id === resourceId);
};

const submitResourceRating = async (data: {
  resourceId: string;
  rating: number;
  comment?: string;
}): Promise<ResourceRating> => {
  await delay(500);
  
  const userIP = 'user-ip-simulation'; // En vrai, on récupérerait l'IP
  const newRating: ResourceRating = {
    id: Date.now().toString(),
    resource_id: data.resourceId,
    user_ip: userIP,
    rating: data.rating,
    comment: data.comment,
    created_at: new Date().toISOString()
  };
  
  // Vérifier si l'utilisateur a déjà noté
  const existingRatingIndex = mockRatings.findIndex(
    r => r.resource_id === data.resourceId && r.user_ip === userIP
  );
  
  if (existingRatingIndex >= 0) {
    // Mettre à jour la note existante
    mockRatings[existingRatingIndex] = newRating;
  } else {
    // Ajouter une nouvelle note
    mockRatings.push(newRating);
  }
  
  return newRating;
};

export function useResourceRatings(resourceId: string) {
  return useQuery({
    queryKey: ['resourceRatings', resourceId],
    queryFn: () => fetchResourceRatings(resourceId),
    enabled: !!resourceId,
  });
}

export function useSubmitResourceRating() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitResourceRating,
    onSuccess: (newRating) => {
      // Invalider les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['resourceRatings', newRating.resource_id] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource', newRating.resource_id] });
    },
  });
}

export function useUserRatingForResource(resourceId: string) {
  const userIP = 'user-ip-simulation';
  
  return useQuery({
    queryKey: ['userRating', resourceId, userIP],
    queryFn: async () => {
      await delay(200);
      return mockRatings.find(
        r => r.resource_id === resourceId && r.user_ip === userIP
      ) || null;
    },
    enabled: !!resourceId,
  });
}