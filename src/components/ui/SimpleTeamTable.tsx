import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Users, Briefcase, Clock } from "lucide-react";

interface TeamMember {
  person: string;
  role: string[];
  timeAvailable: string;
}

interface SimpleTeamTableProps {
  teamMembers: TeamMember[];
  onTeamMemberChange: (index: number, field: string, value: any) => void;
  onAddTeamMember: () => void;
  onRemoveTeamMember: (index: number) => void;
}

const SimpleTeamTable: React.FC<SimpleTeamTableProps> = ({
  teamMembers,
  onTeamMemberChange,
  onAddTeamMember,
  onRemoveTeamMember,
}) => {

  const handleRoleChange = (memberIndex: number, roleValue: string) => {
    // Pour simplifier, on ne garde qu'un seul rôle par personne
    onTeamMemberChange(memberIndex, 'role', [roleValue]);
  };

  const getSelectedRole = (member: TeamMember) => {
    return member.role && member.role.length > 0 ? member.role[0] : '';
  };

  return (
    <div className="w-full">
      {/* Version desktop - Tableau unifié */}
      <div className="hidden md:block">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* En-tête du tableau */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="col-span-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Users className="h-4 w-4 text-blue-500" />
              Nom
            </div>
            <div className="col-span-6 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Briefcase className="h-4 w-4 text-purple-500" />
              Rôle
            </div>
            <div className="col-span-3 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4 text-green-500" />
              Disponibilité
            </div>
            <div className="col-span-1"></div>
          </div>

          {/* Lignes du tableau */}
          {teamMembers.map((member, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 px-4 py-4 items-stretch border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
              {/* Nom */}
              <div className="col-span-2 flex items-center">
                <Textarea
                  value={member.person}
                  onChange={(e) => onTeamMemberChange(index, 'person', e.target.value)}
                  placeholder="Nom"
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 min-h-[40px] resize-none"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '40px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
              </div>

              {/* Rôle */}
              <div className="col-span-6">
                <Textarea
                  value={getSelectedRole(member)}
                  onChange={(e) => handleRoleChange(index, e.target.value)}
                  placeholder="Ex: S'occupe du développement commercial et de la création du site web, la publication sur les réseaux sociaux etc..."
                  className="w-full border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 min-h-[40px] resize-none"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '40px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
              </div>

              {/* Disponibilité */}
              <div className="col-span-3 flex items-center">
                <Textarea
                  value={member.timeAvailable}
                  onChange={(e) => onTeamMemberChange(index, 'timeAvailable', e.target.value)}
                  placeholder="Ex: 20h/semaine"
                  className="w-full border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-200 min-h-[40px] resize-none"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '40px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
              </div>

              {/* Bouton supprimer */}
              <div className="col-span-1 flex justify-center items-center">
                {teamMembers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTeamMember(index)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Ligne du bouton d'ajout */}
          <div className="px-4 py-4 bg-gray-50/50 border-t border-gray-200">
            <Button
              onClick={onAddTeamMember}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Ajouter une personne
            </Button>
          </div>
        </div>
      </div>

      {/* Version mobile - Cards */}
      <div className="md:hidden space-y-4">
        {teamMembers.map((member, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            {/* En-tête mobile */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-800">Membre {index + 1}</span>
              </div>
              {teamMembers.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveTeamMember(index)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <Textarea
                  value={member.person}
                  onChange={(e) => onTeamMemberChange(index, 'person', e.target.value)}
                  placeholder="Nom"
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 min-h-[40px] resize-none"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '40px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <Textarea
                  value={getSelectedRole(member)}
                  onChange={(e) => handleRoleChange(index, e.target.value)}
                  placeholder="Ex: S'occupe de développement commercial et de la création du site web, la publication sur les réseaux sociaux etc..."
                  className="w-full border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 min-h-[40px] resize-none"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '40px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
              </div>

              {/* Disponibilité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
                <Textarea
                  value={member.timeAvailable}
                  onChange={(e) => onTeamMemberChange(index, 'timeAvailable', e.target.value)}
                  placeholder="Ex: 20h/semaine"
                  className="w-full border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-200 min-h-[40px] resize-none"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '40px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Bouton d'ajout mobile */}
        <Button
          onClick={onAddTeamMember}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Ajouter une personne
        </Button>
      </div>
    </div>
  );
};

export default SimpleTeamTable;