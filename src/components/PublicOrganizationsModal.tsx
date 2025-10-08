import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Building, MapPin, Search, Loader2, SlidersHorizontal, ChevronDown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { filterByDistance } from "@/services/geocodingService";
import OrganizationDetailsModal from "./OrganizationDetailsModal";

interface Organization {
  id: string;
  name: string;
  description?: string;
  address?: string;
  logo_url?: string;
  banner_url?: string;
  primary_color?: string;
  type?: string;
  custom_type?: string;
  geographic_focus?: string;
  custom_geographic?: string;
  website?: string;
  email?: string;
  phone?: string;
  founded_year?: number;
  mission?: string;
  vision?: string;
  values?: any;
  sectors?: any;
  stages?: any;
  team_size?: number;
  specializations?: any;
  methodology?: string;
  program_duration_months?: number;
  success_criteria?: string;
  support_types?: any;
  social_media?: any;
}

interface OrganizationWithDistance extends Organization {
  distance?: number;
}

interface PublicOrganizationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress?: string;
}

const PublicOrganizationsModal = ({ isOpen, onClose, userAddress }: PublicOrganizationsModalProps) => {
  const [organizations, setOrganizations] = useState<OrganizationWithDistance[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<OrganizationWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [distanceFilter, setDistanceFilter] = useState(100); // Default 100km
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationWithDistance | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [applyingToOrgId, setApplyingToOrgId] = useState<string | null>(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  // Stats
  const stats = {
    total: organizations.length,
    filtered: filteredOrganizations.length,
    nearby: organizations.filter(org => org.distance !== undefined).length,
  };

  useEffect(() => {
    if (isOpen) {
      fetchPublicOrganizations();
    }
  }, [isOpen]);

  useEffect(() => {
    filterOrganizations();
  }, [searchTerm, organizations, distanceFilter]);

  const fetchPublicOrganizations = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('organizations')
        .select(`
          id, name, description, address, logo_url, banner_url, primary_color, 
          type, custom_type, geographic_focus, custom_geographic, website, email, 
          phone, founded_year, mission, vision, values, sectors, stages, team_size, 
          specializations, methodology, program_duration_months, success_criteria, 
          support_types, social_media
        `)
        .eq('is_public', true)
        .eq('onboarding_completed', true)
        .order('name', { ascending: true });

      if (error) throw error;

      let orgsWithDistance = (data as Organization[]) || [];

      // Calculate distances if user has address and API key is available
      if (userAddress && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
        setIsCalculatingDistance(true);
        try {
          const filtered = await filterByDistance(orgsWithDistance, userAddress, 999999); // Very large number to get all
          orgsWithDistance = filtered.map(item => ({
            ...item.organization,
            distance: item.distance
          }));
        } catch (error) {
          console.error('Error calculating distances:', error);
          toast({
            title: "Attention",
            description: "Impossible de calculer les distances. Affichage sans filtre de proximité.",
            variant: "default",
          });
        } finally {
          setIsCalculatingDistance(false);
        }
      }

      setOrganizations(orgsWithDistance);
    } catch (error: any) {
      console.error('Error fetching public organizations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les organisations publiques.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrganizations = () => {
    let filtered = [...organizations];

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(org => 
        org.name.toLowerCase().includes(search) ||
        org.description?.toLowerCase().includes(search) ||
        org.address?.toLowerCase().includes(search) ||
        org.type?.toLowerCase().includes(search) ||
        org.custom_type?.toLowerCase().includes(search) ||
        (typeof org.geographic_focus === 'string' && org.geographic_focus.toLowerCase().includes(search)) ||
        org.custom_geographic?.toLowerCase().includes(search)
      );
    }

    // Filter by distance if calculated and user has adjusted slider
    if (userAddress && organizations.some(org => org.distance !== undefined) && distanceFilter < 200) {
      filtered = filtered.filter(org => 
        org.distance !== undefined && org.distance <= distanceFilter
      );
    }

    setFilteredOrganizations(filtered);
  };

  const getImageUrl = (path: string | undefined, bucket: 'organisation-logo' | 'organisation-banner'): string | undefined => {
    if (!path) return undefined;
    
    try {
      const { data } = supabase.storage.from(bucket as any).getPublicUrl(path);
      return data?.publicUrl;
    } catch (error) {
      console.error(`Error getting public URL for ${bucket}:`, error);
      return undefined;
    }
  };

  const handleApply = async (organizationId: string) => {
    setApplyingToOrgId(organizationId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour postuler.",
          variant: "destructive",
        });
        return;
      }

      // Check if user already has a pending application
      const { data: existingApplication, error: checkError } = await (supabase as any)
        .from('organisation_applications')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw checkError;
      }

      if (existingApplication) {
        toast({
          title: "Candidature déjà envoyée",
          description: `Vous avez déjà une candidature ${(existingApplication as any).status === 'pending' ? 'en attente' : (existingApplication as any).status} pour cette organisation.`,
          variant: "default",
        });
        return;
      }

      // Create new application
      const { error: insertError } = await (supabase as any)
        .from('organisation_applications')
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          status: 'pending'
        });

      if (insertError) throw insertError;

      const org = organizations.find(o => o.id === organizationId);
      toast({
        title: "Candidature envoyée ! 🎉",
        description: `Votre candidature à ${org?.name} a été envoyée avec succès. Vous serez notifié de la réponse.`,
      });

      // Optionally close the modal or refresh
      // onClose();
    } catch (error: any) {
      console.error('Error applying to organization:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de votre candidature.",
        variant: "destructive",
      });
    } finally {
      setApplyingToOrgId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Découvrez les organisations publiques
          </DialogTitle>
          <DialogDescription>
            Parcourez et postulez aux organisations d'accompagnement entrepreneurial qui correspondent à votre projet.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 py-2">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total organisations</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef2ed', color: '#ff5932' }}>
                      <Building className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Résultats affichés</p>
                      <p className="text-2xl font-bold">{stats.filtered}</p>
                    </div>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef2ed', color: '#ff5932' }}>
                      <Search className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avec adresse</p>
                      <p className="text-2xl font-bold">{stats.nearby}</p>
                    </div>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef2ed', color: '#ff5932' }}>
                      <MapPin className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters Section */}
            <Card className="border">
              <div 
                className="cursor-pointer flex items-center justify-between p-4"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Filtres et Recherche</CardTitle>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-gray-600 transition-transform duration-300",
                  filtersOpen ? 'rotate-180' : ''
                )} />
              </div>

              <div className={cn(
                "transition-all duration-300 overflow-hidden",
                filtersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                <CardContent className="pt-0 pb-4">
                  <div className="space-y-4">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher une organisation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 focus:ring-0 focus:border-gray-300"
                      />
                    </div>

                    {/* Distance Filter */}
                    {userAddress && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Distance maximale</span>
                          <span className="text-sm font-medium text-gray-700">{distanceFilter} km</span>
                        </div>
                        
                        <Slider
                          value={[distanceFilter]}
                          onValueChange={(values) => setDistanceFilter(values[0])}
                          min={10}
                          max={200}
                          step={10}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500">
                          {isCalculatingDistance ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Calcul des distances en cours...
                            </span>
                          ) : organizations.some(org => org.distance !== undefined) ? (
                            `${filteredOrganizations.filter(org => org.distance !== undefined).length} organisation(s) dans ce rayon`
                          ) : (
                            "Aucune adresse trouvée pour calculer les distances"
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Organizations Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-aurentia-pink" />
              </div>
            ) : filteredOrganizations.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm || (userAddress && organizations.some(org => org.distance !== undefined) && distanceFilter < 200)
                    ? "Aucune organisation ne correspond à vos critères de recherche." 
                    : "Aucune organisation publique disponible pour le moment."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrganizations.map((org) => {
                  const logoUrl = getImageUrl(org.logo_url, 'organisation-logo');
                  const bannerUrl = getImageUrl(org.banner_url, 'organisation-banner');

                  return (
                    <Card
                      key={org.id}
                      className="group cursor-pointer transition-all duration-300 overflow-hidden border hover:shadow-lg"
                    >
                      {/* Banner */}
                      <div className="h-32 bg-gradient-to-r from-aurentia-pink to-aurentia-orange relative overflow-hidden">
                        {bannerUrl ? (
                          <img
                            src={bannerUrl}
                            alt={`${org.name} banner`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to gradient if image fails to load
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                      </div>

                      <CardContent className="p-4">
                        {/* Logo and Title */}
                        <div className="flex gap-3 mb-3">
                          <div className="flex-shrink-0 -mt-8 relative z-10">
                            {logoUrl ? (
                              <img
                                src={logoUrl}
                                alt={`${org.name} logo`}
                                className="h-16 w-16 rounded-lg object-cover border-2 border-white bg-white shadow-md"
                                onError={(e) => {
                                  // Fallback to initial letter
                                  const target = e.target as HTMLImageElement;
                                  const parent = target.parentElement;
                                  if (parent) {
                                    target.style.display = 'none';
                                    const fallback = document.createElement('div');
                                    fallback.className = 'h-16 w-16 rounded-lg flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-md';
                                    fallback.style.backgroundColor = org.primary_color || '#F04F6A';
                                    fallback.textContent = org.name.charAt(0).toUpperCase();
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            ) : (
                              <div 
                                className="h-16 w-16 rounded-lg flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-md"
                                style={{ backgroundColor: org.primary_color || '#F04F6A' }}
                              >
                                {org.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-semibold mb-1 group-hover:text-aurentia-pink transition-colors line-clamp-1">
                              {org.name}
                            </CardTitle>
                          </div>
                        </div>

                        {/* Description */}
                        {org.description && (
                          <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {org.description}
                          </CardDescription>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {org.distance !== undefined && (
                            <span className="text-xs px-2 py-1 bg-aurentia-pink/10 text-aurentia-pink rounded-md font-medium">
                              📍 {org.distance} km
                            </span>
                          )}
                          {org.address && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[200px]">{org.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Details Button */}
                        <Button
                          onClick={() => {
                            setSelectedOrg(org);
                            setDetailsModalOpen(true);
                          }}
                          className="w-full text-white"
                          style={{ backgroundColor: '#ff5932' }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Détails
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Organization Details Modal */}
      <OrganizationDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedOrg(null);
        }}
        organization={selectedOrg}
        distance={selectedOrg?.distance}
        onApply={handleApply}
        isApplying={applyingToOrgId === selectedOrg?.id}
      />
    </Dialog>
  );
};

export default PublicOrganizationsModal;
