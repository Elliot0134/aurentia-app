import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowUp, Loader2, Search, Filter, Star, MapPin, Mail, Phone, Globe, Users, Award, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Partner {
  id: number;
  name: string;
  agency: string;
  domain: string;
  specialties: string[];
  priceRange: {
    min: number;
    max: number;
  };
  rating: number;
  reviewCount: number;
  location: string;
  image: string;
  description: string;
  experience: string;
  completedProjects: number;
  responseTime: string;
  languages: string[];
  portfolio: string;
  email: string;
  phone: string;
  certifications: string[];
  availability: 'Disponible' | 'Occupé' | 'Partiellement disponible';
}

// Données de démonstration
const mockPartners: Partner[] = [
  {
    id: 1,
    name: "Marie Dubois",
    agency: "Creative Studio MD",
    domain: "Design Graphique",
    specialties: ["Logo", "Charte graphique", "UI/UX", "Branding"],
    priceRange: { min: 500, max: 2000 },
    rating: 4.9,
    reviewCount: 47,
    location: "Paris, France",
    image: "/placeholder.svg",
    description: "Designer graphique passionnée avec 8 ans d'expérience dans la création d'identités visuelles fortes et mémorables.",
    experience: "8 ans",
    completedProjects: 156,
    responseTime: "< 2h",
    languages: ["Français", "Anglais"],
    portfolio: "https://mariedubois-design.com",
    email: "marie@creativestudiomd.com",
    phone: "+33 6 12 34 56 78",
    certifications: ["Adobe Certified Expert", "Google UX Design"],
    availability: "Disponible"
  },
  {
    id: 2,
    name: "Thomas Martin",
    agency: "DevCraft Solutions",
    domain: "Développement Web",
    specialties: ["React", "Node.js", "E-commerce", "API"],
    priceRange: { min: 800, max: 3500 },
    rating: 4.8,
    reviewCount: 32,
    location: "Lyon, France",
    image: "/placeholder.svg",
    description: "Développeur full-stack spécialisé dans les applications web modernes et les solutions e-commerce sur mesure.",
    experience: "6 ans",
    completedProjects: 89,
    responseTime: "< 4h",
    languages: ["Français", "Anglais", "Espagnol"],
    portfolio: "https://devcraft-solutions.fr",
    email: "thomas@devcraft-solutions.fr",
    phone: "+33 6 98 76 54 32",
    certifications: ["AWS Certified", "React Professional"],
    availability: "Partiellement disponible"
  },
  {
    id: 3,
    name: "Sophie Laurent",
    agency: "SEO Masters",
    domain: "Marketing Digital",
    specialties: ["SEO", "Google Ads", "Analytics", "Content Marketing"],
    priceRange: { min: 600, max: 2500 },
    rating: 4.7,
    reviewCount: 63,
    location: "Marseille, France",
    image: "/placeholder.svg",
    description: "Experte en référencement naturel et payant, j'aide les entreprises à améliorer leur visibilité en ligne.",
    experience: "5 ans",
    completedProjects: 124,
    responseTime: "< 1h",
    languages: ["Français", "Anglais"],
    portfolio: "https://seo-masters.fr",
    email: "sophie@seo-masters.fr",
    phone: "+33 6 45 67 89 12",
    certifications: ["Google Ads Certified", "SEMrush Certified"],
    availability: "Disponible"
  },
  {
    id: 4,
    name: "Alexandre Petit",
    agency: "Mobile First Agency",
    domain: "Développement Mobile",
    specialties: ["React Native", "Flutter", "iOS", "Android"],
    priceRange: { min: 1000, max: 4000 },
    rating: 4.9,
    reviewCount: 28,
    location: "Toulouse, France",
    image: "/placeholder.svg",
    description: "Développeur mobile expert en applications cross-platform avec une approche mobile-first.",
    experience: "7 ans",
    completedProjects: 67,
    responseTime: "< 3h",
    languages: ["Français", "Anglais"],
    portfolio: "https://mobilefirst-agency.com",
    email: "alexandre@mobilefirst-agency.com",
    phone: "+33 6 23 45 67 89",
    certifications: ["Google Mobile Web Specialist", "Apple Developer"],
    availability: "Occupé"
  },
  {
    id: 5,
    name: "Camille Rousseau",
    agency: "Content Creator Pro",
    domain: "Création de Contenu",
    specialties: ["Rédaction web", "Copywriting", "Social Media", "Storytelling"],
    priceRange: { min: 300, max: 1500 },
    rating: 4.6,
    reviewCount: 41,
    location: "Bordeaux, France",
    image: "/placeholder.svg",
    description: "Rédactrice web et copywriter spécialisée dans la création de contenus engageants et optimisés SEO.",
    experience: "4 ans",
    completedProjects: 203,
    responseTime: "< 2h",
    languages: ["Français", "Anglais", "Italien"],
    portfolio: "https://contentcreatorpro.fr",
    email: "camille@contentcreatorpro.fr",
    phone: "+33 6 78 90 12 34",
    certifications: ["HubSpot Content Marketing", "Google Analytics"],
    availability: "Disponible"
  },
  {
    id: 6,
    name: "Julien Moreau",
    agency: "Data Insights Lab",
    domain: "Data Science",
    specialties: ["Machine Learning", "Python", "Tableau", "Business Intelligence"],
    priceRange: { min: 1200, max: 5000 },
    rating: 4.8,
    reviewCount: 19,
    location: "Nantes, France",
    image: "/placeholder.svg",
    description: "Data scientist expérimenté, je transforme vos données en insights actionnables pour votre business.",
    experience: "9 ans",
    completedProjects: 45,
    responseTime: "< 6h",
    languages: ["Français", "Anglais"],
    portfolio: "https://datainsightslab.fr",
    email: "julien@datainsightslab.fr",
    phone: "+33 6 34 56 78 90",
    certifications: ["AWS Machine Learning", "Tableau Desktop Specialist"],
    availability: "Partiellement disponible"
  }
];

const Partenaires = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [domain, setDomain] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleSubmit = async () => {
    if (!user || !firstName.trim() || !lastName.trim() || !portfolio.trim() || !domain.trim()) {
      console.error("User not logged in, or first name, last name, portfolio, or domain is empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('https://n8n.eec-technologies.fr/webhook/partenaires-freelances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          firstName: firstName,
          lastName: lastName,
          portfolio: portfolio,
          domain: domain,
        }),
      });

      if (response.ok) {
        console.log("Data sent successfully!");
        setShowPopup(false);
      } else {
        console.error("Failed to send data:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrage et tri des partenaires
  const filteredAndSortedPartners = mockPartners
    .filter(partner => {
      const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           partner.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           partner.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDomain = selectedDomain === 'all' || partner.domain === selectedDomain;
      
      const matchesPrice = partner.priceRange.min <= priceRange[1] && partner.priceRange.max >= priceRange[0];
      
      const matchesAvailability = selectedAvailability === 'all' || partner.availability === selectedAvailability;
      
      return matchesSearch && matchesDomain && matchesPrice && matchesAvailability;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.priceRange.min - b.priceRange.min;
        case 'price-high':
          return b.priceRange.max - a.priceRange.max;
        case 'experience':
          return parseInt(b.experience) - parseInt(a.experience);
        case 'projects':
          return b.completedProjects - a.completedProjects;
        default:
          return 0;
      }
    });

  const domains = Array.from(new Set(mockPartners.map(p => p.domain)));

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Disponible':
        return 'bg-green-100 text-green-800';
      case 'Occupé':
        return 'bg-red-100 text-red-800';
      case 'Partiellement disponible':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Partenaires Aurentia</h1>
          <p className="text-gray-600">Trouvez le partenaire idéal pour votre projet</p>
        </div>
        <Button 
          onClick={() => setShowPopup(true)}
          className="bg-gradient-primary hover:from-blue-600 hover:to-purple-700"
        >
          Devenir Partenaire
        </Button>
      </div>

      {/* Filtres */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et Recherche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, agence ou spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtre par domaine */}
            <div>
              <label className="text-sm font-medium mb-2 block">Domaine</label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les domaines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les domaines</SelectItem>
                  {domains.map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par disponibilité */}
            <div>
              <label className="text-sm font-medium mb-2 block">Disponibilité</label>
              <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="Partiellement disponible">Partiellement disponible</SelectItem>
                  <SelectItem value="Occupé">Occupé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tri */}
            <div>
              <label className="text-sm font-medium mb-2 block">Trier par</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Note</SelectItem>
                  <SelectItem value="price-low">Prix croissant</SelectItem>
                  <SelectItem value="price-high">Prix décroissant</SelectItem>
                  <SelectItem value="experience">Expérience</SelectItem>
                  <SelectItem value="projects">Projets réalisés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nombre de résultats */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {filteredAndSortedPartners.length} partenaire{filteredAndSortedPartners.length > 1 ? 's' : ''} trouvé{filteredAndSortedPartners.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Filtre de prix */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Fourchette de prix: {priceRange[0]}€ - {priceRange[1]}€
            </label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={5000}
              min={0}
              step={100}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grille des partenaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedPartners.map((partner) => (
          <Card key={partner.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedPartner(partner)}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={partner.image}
                    alt={partner.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <CardTitle className="text-lg">{partner.name}</CardTitle>
                    <CardDescription className="text-sm">{partner.agency}</CardDescription>
                  </div>
                </div>
                <Badge className={getAvailabilityColor(partner.availability)}>
                  {partner.availability}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge variant="outline" className="mb-2">{partner.domain}</Badge>
                <p className="text-sm text-gray-600 line-clamp-2">{partner.description}</p>
              </div>

              <div className="flex flex-wrap gap-1">
                {partner.specialties.slice(0, 3).map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {partner.specialties.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{partner.specialties.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{partner.rating}</span>
                  <span className="text-gray-500">({partner.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{partner.location.split(',')[0]}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-green-600">
                    {partner.priceRange.min}€ - {partner.priceRange.max}€
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>Répond {partner.responseTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedPartners.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun partenaire ne correspond à vos critères de recherche.</p>
          <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos filtres pour voir plus de résultats.</p>
        </div>
      )}

      {/* Dialog détaillé du partenaire */}
      <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPartner && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={selectedPartner.image}
                    alt={selectedPartner.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedPartner.name}</DialogTitle>
                    <DialogDescription className="text-lg font-medium text-gray-700">
                      {selectedPartner.agency}
                    </DialogDescription>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge className={getAvailabilityColor(selectedPartner.availability)}>
                        {selectedPartner.availability}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{selectedPartner.rating}</span>
                        <span className="text-gray-500">({selectedPartner.reviewCount} avis)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">À propos</h3>
                    <p className="text-gray-700">{selectedPartner.description}</p>
                  </div>

                  {/* Spécialités */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Spécialités</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPartner.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPartner.certifications.map((cert) => (
                        <Badge key={cert} className="bg-blue-100 text-blue-800">
                          <Award className="h-3 w-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Langues */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Langues</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPartner.languages.map((lang) => (
                        <Badge key={lang} variant="secondary">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Informations clés */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations clés</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedPartner.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedPartner.completedProjects} projets réalisés</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Répond {selectedPartner.responseTime}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedPartner.experience} d'expérience</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tarifs */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tarifs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedPartner.priceRange.min}€ - {selectedPartner.priceRange.max}€
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Par projet</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedPartner.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedPartner.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <a href={selectedPartner.portfolio} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          Portfolio
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bouton d'action */}
                  <Button className="w-full bg-gradient-primary hover:from-blue-600 hover:to-purple-700" size="lg">
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer une demande
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour devenir partenaire */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle className="bg-gradient-primary text-transparent bg-clip-text text-3xl">Devenir Partenaire Aurentia</DialogTitle>
            <Separator className="my-4" />
            <DialogDescription className="text-black">
              Rejoignez notre réseau de partenaires qualifiés et développez votre activité en collaborant avec des porteurs de projets ambitieux.
              <br /><br />
              En tant que partenaire Aurentia, vous bénéficierez d'une visibilité accrue et d'un accès privilégié à des projets correspondant à votre expertise.
            </DialogDescription>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <div className="text-black text-center mb-4">
                <p className="font-semibold">Candidature partenaire</p>
                <p>Remplissez le formulaire ci-dessous pour nous rejoindre</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    placeholder="Nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <Input
                  type="text"
                  placeholder="Votre site / Portfolio"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Votre domaine d'activité"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !firstName.trim() || !lastName.trim() || !portfolio.trim() || !domain.trim()}
                    className="rounded-xl w-10 h-10 p-0 bg-gradient-primary hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <ArrowUp size={18} className="text-white" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Partenaires;
