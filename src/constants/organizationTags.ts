/**
 * Shared constants for organization tags and categories
 * Used across onboarding, profile, and other organization-related pages
 */

export const ORGANISATION_TYPES = [
  { value: "incubator", label: "Incubateur" },
  { value: "accelerator", label: "Accélérateur" },
  { value: "business_school", label: "École de commerce" },
  { value: "university", label: "Université" },
  { value: "consulting", label: "Cabinet de conseil" },
  { value: "other", label: "Autre" }
];

export const SECTOR_OPTIONS = [
  "Tech", 
  "Fintech", 
  "Healthtech", 
  "Edtech", 
  "Agritech", 
  "Cleantech",
  "E-commerce", 
  "SaaS", 
  "IoT", 
  "IA/Machine Learning", 
  "Blockchain",
  "Mobilité", 
  "Immobilier", 
  "Retail", 
  "Manufacturing", 
  "Services",
  "Entertainment", 
  "Cybersécurité", 
  "Biotechnologie", 
  "Energie",
  "Foodtech", 
  "Proptech", 
  "Legaltech", 
  "Insurtech", 
  "Medtech",
  "Deeptech", 
  "Greentech", 
  "Regtech", 
  "Martech", 
  "Autre"
];

export const STAGE_OPTIONS = [
  "Idéation", 
  "Pré-seed", 
  "Seed", 
  "Série A", 
  "Série B", 
  "Série C+",
  "Growth stage", 
  "Scale-up", 
  "Expansion internationale", 
  "Early stage",
  "Late stage", 
  "Pre-revenue", 
  "Post-revenue", 
  "Breakeven", 
  "Profitable"
];

export const SPECIALIZATION_OPTIONS = [
  "Accompagnement stratégique", 
  "Développement produit", 
  "Marketing digital",
  "Financement", 
  "Juridique", 
  "RH", 
  "Technologie", 
  "International",
  "Opérations", 
  "Ventes", 
  "Partenariats", 
  "Pitch training",
  "Go-to-market", 
  "Product-market fit", 
  "Growth hacking", 
  "Fundraising",
  "Business development", 
  "Innovation", 
  "Transformation digitale"
];

export const SUPPORT_TYPE_OPTIONS = [
  "Mentoring individuel", 
  "Workshops collectifs", 
  "Formations",
  "Financement direct", 
  "Mise en relation investisseurs",
  "Espaces de coworking", 
  "Support technique", 
  "Support juridique",
  "Développement commercial", 
  "Networking", 
  "Coaching personnalisé",
  "Masterclasses", 
  "Bootcamps", 
  "Hackathons", 
  "Pitch sessions",
  "Demo days", 
  "Accès à des experts", 
  "Ressources en ligne",
  "Accompagnement réglementaire", 
  "Support comptable"
];

export const GEOGRAPHIC_OPTIONS = [
  "France", 
  "Europe", 
  "Amérique du Nord", 
  "Amérique du Sud",
  "Afrique", 
  "Asie", 
  "Océanie", 
  "International"
];

/**
 * Default organization brand colors
 * These are Aurentia's default colors, used when creating a new organization
 */
export const DEFAULT_ORGANIZATION_COLORS = {
  PRIMARY: "#FF592C",    // Aurentia orange
  SECONDARY: "#FF592C"   // Aurentia orange (same as primary for consistency)
};
