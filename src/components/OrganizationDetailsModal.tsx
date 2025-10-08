import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Calendar,
  Target,
  Award,
  Users,
  TrendingUp,
  ArrowRight,
  Loader2
} from "lucide-react";

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
  geographic_focus?: any;
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

interface OrganizationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
  distance?: number;
  onApply?: (orgId: string) => void;
  isApplying?: boolean;
}

const OrganizationDetailsModal = ({ 
  isOpen, 
  onClose, 
  organization,
  distance,
  onApply,
  isApplying = false
}: OrganizationDetailsModalProps) => {
  if (!organization) return null;

  const getImageUrl = (path: string | undefined, bucket: 'organisation-logo' | 'organisation-banner'): string | undefined => {
    if (!path) return undefined;
    
    // If it's already a full URL, return it
    if (path.startsWith('http')) return path;
    
    // Otherwise construct the Supabase URL
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  };

  const logoUrl = getImageUrl(organization.logo_url, 'organisation-logo');
  const bannerUrl = getImageUrl(organization.banner_url, 'organisation-banner');

  const parseJsonField = (field: any): string[] => {
    if (!field) return [];
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    if (Array.isArray(field)) return field;
    return [];
  };

  const sectors = parseJsonField(organization.sectors);
  const stages = parseJsonField(organization.stages);
  const values = parseJsonField(organization.values);
  const specializations = parseJsonField(organization.specializations);
  const supportTypes = parseJsonField(organization.support_types);
  const geographicFocus = parseJsonField(organization.geographic_focus);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Banner */}
        <div className="relative -mx-6 -mt-6 mb-6">
          <div className="h-48 bg-gradient-to-r from-aurentia-pink to-aurentia-orange relative overflow-hidden">
            {bannerUrl && (
              <img
                src={bannerUrl}
                alt={`${organization.name} banner`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
          
          {/* Logo */}
          <div className="absolute -bottom-12 left-6">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${organization.name} logo`}
                className="h-24 w-24 rounded-xl object-cover border-4 border-white bg-white shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) {
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'h-24 w-24 rounded-xl flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg';
                    fallback.style.backgroundColor = organization.primary_color || '#F04F6A';
                    fallback.textContent = organization.name.charAt(0).toUpperCase();
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div 
                className="h-24 w-24 rounded-xl flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg"
                style={{ backgroundColor: organization.primary_color || '#F04F6A' }}
              >
                {organization.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="pt-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">{organization.name}</DialogTitle>
            {organization.description && (
              <DialogDescription className="text-base mt-2">
                {organization.description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-3 text-sm">
          {organization.address && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{organization.address}</span>
              {distance !== undefined && (
                <span className="text-aurentia-pink font-medium ml-1">• {distance} km</span>
              )}
            </div>
          )}
          {organization.website && (
            <a 
              href={organization.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-aurentia-pink hover:underline"
            >
              <Globe className="h-4 w-4" />
              <span>Site web</span>
            </a>
          )}
          {organization.email && (
            <a 
              href={`mailto:${organization.email}`}
              className="flex items-center gap-1.5 text-gray-600 hover:text-aurentia-pink"
            >
              <Mail className="h-4 w-4" />
              <span>{organization.email}</span>
            </a>
          )}
          {organization.phone && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{organization.phone}</span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Main Content */}
        <div className="space-y-6">
          {/* Mission & Vision */}
          {(organization.mission || organization.vision) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-aurentia-pink" />
                  Mission & Vision
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {organization.mission && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">Mission</h4>
                    <p className="text-sm text-gray-600">
                      {organization.mission === "Mission à définir" || organization.mission.trim() === "" 
                        ? "Non précisée" 
                        : organization.mission}
                    </p>
                  </div>
                )}
                {organization.vision && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">Vision</h4>
                    <p className="text-sm text-gray-600">
                      {organization.vision === "Vision à définir" || organization.vision.trim() === "" 
                        ? "Non précisée" 
                        : organization.vision}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Values */}
          {values.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-aurentia-pink" />
                  Valeurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {values.map((value: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sectors & Stages */}
          {(sectors.length > 0 || stages.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-aurentia-pink" />
                  Secteurs & Stades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sectors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Secteurs</h4>
                    <div className="flex flex-wrap gap-2">
                      {sectors.map((sector: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {stages.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Stades accompagnés</h4>
                    <div className="flex flex-wrap gap-2">
                      {stages.map((stage: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {stage}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Geographic Focus */}
          {(geographicFocus.length > 0 || organization.custom_geographic) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-aurentia-pink" />
                  Zone géographique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {geographicFocus.map((geo: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {geo}
                    </Badge>
                  ))}
                  {organization.custom_geographic && (
                    <Badge variant="secondary">
                      {organization.custom_geographic}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Specializations & Support Types */}
          {(specializations.length > 0 || supportTypes.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-aurentia-pink" />
                  Accompagnement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {specializations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Spécialisations</h4>
                    <div className="flex flex-wrap gap-2">
                      {specializations.map((spec: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {supportTypes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Types de support</h4>
                    <div className="flex flex-wrap gap-2">
                      {supportTypes.map((type: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Methodology & Success Criteria */}
          {(organization.methodology || organization.success_criteria) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-aurentia-pink" />
                  Méthodologie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {organization.methodology && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">Approche</h4>
                    <p className="text-sm text-gray-600">{organization.methodology}</p>
                  </div>
                )}
                {organization.success_criteria && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">Critères de succès</h4>
                    <p className="text-sm text-gray-600">{organization.success_criteria}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-aurentia-pink" />
                Informations complémentaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {organization.founded_year && (
                  <div>
                    <span className="text-gray-600">Année de création:</span>
                    <span className="ml-2 font-medium">{organization.founded_year}</span>
                  </div>
                )}
                {organization.team_size && (
                  <div>
                    <span className="text-gray-600">Taille de l'équipe:</span>
                    <span className="ml-2 font-medium">{organization.team_size} personnes</span>
                  </div>
                )}
                {organization.program_duration_months && (
                  <div>
                    <span className="text-gray-600">Durée du programme:</span>
                    <span className="ml-2 font-medium">{organization.program_duration_months} mois</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="border-t pt-4 mt-6">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {onApply && (
            <Button
              onClick={() => onApply(organization.id)}
              disabled={isApplying}
              className="text-white"
              style={{ backgroundColor: '#ff5932' }}
            >
              {isApplying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Postuler
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationDetailsModal;
