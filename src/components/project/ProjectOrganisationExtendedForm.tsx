import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Scale, Shield, TrendingUp, Users2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectOrganisationExtendedFormProps {
  formData: {
    businessType: string;
    city: string;
    address: string;
    stage: string;
    requiredResources: string[];
    legalStatus: string;
    legalForm: string;
    ipStatus: string;
    ipDetails: string;
    revenue: number | '';
    fundingPlanned: boolean;
    fundingAmount: number | '';
    fundingStage: string;
    teamSize: number | '';
  };
  onChange: (data: any) => void;
}

const ProjectOrganisationExtendedForm: React.FC<ProjectOrganisationExtendedFormProps> = ({ formData, onChange }) => {
  const [newResource, setNewResource] = useState('');

  const handleChange = (field: string, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const addResource = () => {
    if (newResource.trim()) {
      handleChange('requiredResources', [...formData.requiredResources, newResource.trim()]);
      setNewResource('');
    }
  };

  const removeResource = (index: number) => {
    const updated = formData.requiredResources.filter((_, i) => i !== index);
    handleChange('requiredResources', updated);
  };

  return (
    <div className="space-y-6">
      {/* Business Context */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle>Contexte Business</CardTitle>
          </div>
          <CardDescription>
            Informations sur le type et la localisation de votre projet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessType">Type de business *</Label>
              <Select
                value={formData.businessType}
                onValueChange={(value) => handleChange('businessType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="consulting">Conseil</SelectItem>
                  <SelectItem value="education">Éducation/Formation</SelectItem>
                  <SelectItem value="health">Santé</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="hardware">Matériel/Hardware</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage">Stade de développement *</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => handleChange('stage', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un stade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">💡 Idée</SelectItem>
                  <SelectItem value="prototype">🔧 Prototype</SelectItem>
                  <SelectItem value="mvp">🚀 MVP</SelectItem>
                  <SelectItem value="market">📈 Sur le marché</SelectItem>
                  <SelectItem value="growth">📊 En pleine croissance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Ville *
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Paris, Lyon, Marseille..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse complète (optionnel)</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Rue de la République"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources & Team */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-primary" />
            <CardTitle>Ressources & Équipe</CardTitle>
          </div>
          <CardDescription>
            Ressources nécessaires et taille de l'équipe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requiredResources">Ressources nécessaires</Label>
            <div className="flex gap-2">
              <Input
                value={newResource}
                onChange={(e) => setNewResource(e.target.value)}
                placeholder="Ex: Développeur, Designer, Marketer..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
              />
              <Button type="button" onClick={addResource}>Ajouter</Button>
            </div>
            {formData.requiredResources.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.requiredResources.map((resource, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {resource}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeResource(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamSize">Taille de l'équipe *</Label>
            <Input
              id="teamSize"
              type="number"
              min="1"
              value={formData.teamSize}
              onChange={(e) => handleChange('teamSize', parseInt(e.target.value) || '')}
              placeholder="Nombre de personnes dans l'équipe"
            />
          </div>
        </CardContent>
      </Card>

      {/* Legal & IP */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <CardTitle>Juridique & Propriété Intellectuelle</CardTitle>
          </div>
          <CardDescription>
            Informations sur la structure légale et la protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="legalStatus">État de la structure légale *</Label>
              <Select
                value={formData.legalStatus}
                onValueChange={(value) => handleChange('legalStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un état" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Non démarré</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="created">Créée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalForm">Forme juridique (si créée)</Label>
              <Select
                value={formData.legalForm}
                onValueChange={(value) => handleChange('legalForm', value)}
                disabled={formData.legalStatus !== 'created'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une forme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sas">SAS</SelectItem>
                  <SelectItem value="sarl">SARL</SelectItem>
                  <SelectItem value="sasu">SASU</SelectItem>
                  <SelectItem value="eurl">EURL</SelectItem>
                  <SelectItem value="sa">SA</SelectItem>
                  <SelectItem value="ei">Entreprise Individuelle</SelectItem>
                  <SelectItem value="micro">Micro-entreprise</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ipStatus" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              État brevet / licence / protection *
            </Label>
            <Select
              value={formData.ipStatus}
              onValueChange={(value) => handleChange('ipStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un état" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune protection</SelectItem>
                <SelectItem value="pending">En cours de dépôt</SelectItem>
                <SelectItem value="registered">Enregistré</SelectItem>
                <SelectItem value="protected">Protégé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.ipStatus !== 'none' && (
            <div className="space-y-2">
              <Label htmlFor="ipDetails">Détails sur la protection (optionnel)</Label>
              <Textarea
                id="ipDetails"
                value={formData.ipDetails}
                onChange={(e) => handleChange('ipDetails', e.target.value)}
                placeholder="Décrivez votre brevet, marque déposée, ou autre protection..."
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financials */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle>Informations Financières</CardTitle>
          </div>
          <CardDescription>
            Chiffre d'affaires et financement (optionnel)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="revenue">Chiffre d'affaires actuel (€)</Label>
            <Input
              id="revenue"
              type="number"
              min="0"
              step="0.01"
              value={formData.revenue}
              onChange={(e) => handleChange('revenue', parseFloat(e.target.value) || '')}
              placeholder="Laissez vide si pas encore de clients"
            />
            {!formData.revenue && (
              <p className="text-sm text-muted-foreground">
                Si vous n'avez pas encore de clients, laissez ce champ vide
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fundingPlanned"
                checked={formData.fundingPlanned}
                onChange={(e) => handleChange('fundingPlanned', e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="fundingPlanned" className="cursor-pointer">
                Financement prévu ?
              </Label>
            </div>

            {formData.fundingPlanned && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="fundingAmount">Montant recherché (€)</Label>
                  <Input
                    id="fundingAmount"
                    type="number"
                    min="0"
                    value={formData.fundingAmount}
                    onChange={(e) => handleChange('fundingAmount', parseFloat(e.target.value) || '')}
                    placeholder="Ex: 100000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundingStage">Type de levée</Label>
                  <Select
                    value={formData.fundingStage}
                    onValueChange={(value) => handleChange('fundingStage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-seed">Pré-amorçage</SelectItem>
                      <SelectItem value="seed">Amorçage (Seed)</SelectItem>
                      <SelectItem value="series-a">Série A</SelectItem>
                      <SelectItem value="series-b">Série B</SelectItem>
                      <SelectItem value="series-c">Série C+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectOrganisationExtendedForm;
