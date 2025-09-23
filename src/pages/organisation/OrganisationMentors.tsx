import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMentors } from '@/hooks/useOrganisationData';
import type { Mentor } from '@/types/organisationTypes';
import {
  Users
} from "lucide-react";

const OrganisationMentors = () => {
  const { id: organisationId } = useParams();
  
  // Utiliser les données Supabase
  const { mentors, loading: mentorsLoading } = useMentors();

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      active: 'Actif',
      pending: 'En attente',
      inactive: 'Inactif'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-blue-100 text-blue-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (mentorsLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des mentors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mentors</h1>
              <p className="text-gray-600 text-base">
                Liste des mentors de votre organisation.
              </p>
            </div>
          </div>
        </div>

        {/* Mentors */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Mentors de l'organisation
            </CardTitle>
            <CardDescription>
              Liste des mentors et administrateurs de votre organisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-aurentia-pink rounded-full flex items-center justify-center text-white font-semibold">
                      {`${mentor.first_name} ${mentor.last_name}`.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{mentor.first_name} {mentor.last_name}</h3>
                        {getStatusBadge(mentor.status)}
                      </div>
                      <p className="text-sm text-gray-600">{mentor.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mentor.expertise.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{mentor.total_entrepreneurs} entrepreneurs</div>
                    <div className="text-xs text-gray-500">
                      Rejoint le {new Date(mentor.joined_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganisationMentors;