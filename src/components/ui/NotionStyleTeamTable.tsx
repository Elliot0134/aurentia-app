import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Plus, X, Users, Clock, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
  person: string;
  role: string[];
  timeAvailable: string;
}

interface NotionStyleTeamTableProps {
  teamMembers: TeamMember[];
  roleOptions: { value: string; label: string }[];
  onTeamMemberChange: (index: number, field: string, value: any) => void;
  onAddTeamMember: () => void;
  onRemoveTeamMember: (index: number) => void;
  onAddRoleOption: (newOption: { value: string; label: string }) => void;
}

const NotionStyleTeamTable: React.FC<NotionStyleTeamTableProps> = ({
  teamMembers,
  roleOptions,
  onTeamMemberChange,
  onAddTeamMember,
  onRemoveTeamMember,
  onAddRoleOption,
}) => {
  const [isHovering, setIsHovering] = useState<number | null>(null);

  const timeOptions = [
    { value: 'quelques_heures', label: 'Quelques heures/semaine', icon: '⏱️' },
    { value: 'mi_temps', label: 'Mi-temps', icon: '🕐' },
    { value: 'temps_plein', label: 'Temps plein', icon: '🕘' },
    { value: 'variable', label: 'Variable', icon: '🔄' },
  ];

  // Version desktop - Style Notion
  const DesktopView = () => (
    <div className="hidden md:block">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Users className="h-4 w-4" />
              Personne
            </div>
            <div className="col-span-4 flex items-center gap-2 text-sm font-medium text-gray-700">
              <UserPlus className="h-4 w-4" />
              Rôle(s)
            </div>
            <div className="col-span-3 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              Disponibilité
            </div>
            <div className="col-span-1"></div>
          </div>
        </div>

        {/* Rows */}
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className={cn(
              "group border-b border-gray-100 last:border-b-0 px-4 py-3 transition-all duration-200",
              "hover:bg-blue-50/50"
            )}
            onMouseEnter={() => setIsHovering(index)}
            onMouseLeave={() => setIsHovering(null)}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Personne */}
              <div className="col-span-4">
                <Input
                  value={member.person}
                  onChange={(e) => onTeamMemberChange(index, 'person', e.target.value)}
                  placeholder="Prénom Nom"
                  className={cn(
                    "border-0 bg-transparent px-3 py-2 text-sm",
                    "focus:bg-white focus:border focus:border-blue-300 focus:shadow-sm",
                    "hover:bg-gray-50 transition-all duration-200",
                    "rounded-lg"
                  )}
                />
              </div>

              {/* Rôles avec z-index élevé */}
              <div className="col-span-4 relative" style={{ zIndex: 1000 }}>
                <div className="relative">
                  <MultiSelect
                    options={roleOptions}
                    value={member.role}
                    onChange={(selected) => onTeamMemberChange(index, 'role', selected)}
                    placeholder="Sélectionnez les rôles"
                    onAddOption={onAddRoleOption}
                    className={cn(
                      "border-0 bg-transparent text-sm",
                      "hover:bg-gray-50 focus:bg-white focus:border focus:border-blue-300",
                      "transition-all duration-200 rounded-lg"
                    )}
                  />
                </div>
              </div>

              {/* Temps disponible avec z-index élevé */}
              <div className="col-span-3 relative" style={{ zIndex: 999 }}>
                <Select
                  value={member.timeAvailable}
                  onValueChange={(value) => onTeamMemberChange(index, 'timeAvailable', value)}
                >
                  <SelectTrigger className={cn(
                    "border-0 bg-transparent text-sm h-10",
                    "hover:bg-gray-50 focus:bg-white focus:border focus:border-blue-300",
                    "transition-all duration-200 rounded-lg"
                  )}>
                    <SelectValue placeholder="Disponibilité" />
                  </SelectTrigger>
                  <SelectContent 
                    side="bottom" 
                    align="start"
                    className="z-[1000] shadow-lg border border-gray-200 rounded-xl"
                  >
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-sm">
                        <span className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end">
                {teamMembers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTeamMember(index)}
                    className={cn(
                      "h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50",
                      "opacity-0 group-hover:opacity-100 transition-all duration-200",
                      isHovering === index && "opacity-100"
                    )}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Button */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <Button
            onClick={onAddTeamMember}
            variant="ghost"
            className={cn(
              "w-full h-10 text-sm text-gray-600 hover:text-blue-600",
              "hover:bg-blue-50 border-2 border-dashed border-gray-200",
              "hover:border-blue-300 transition-all duration-200 rounded-lg"
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une personne
          </Button>
        </div>
      </div>
    </div>
  );

  // Version mobile - Cards
  const MobileView = () => (
    <div className="md:hidden space-y-4">
      {teamMembers.map((member, index) => (
        <div
          key={index}
          className={cn(
            "bg-white rounded-xl border border-gray-200 p-4 shadow-sm",
            "hover:shadow-md transition-all duration-200"
          )}
        >
          <div className="space-y-4">
            {/* Header de la carte */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm text-gray-700">
                  Membre {index + 1}
                </span>
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

            {/* Nom */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="h-3 w-3" />
                Nom
              </label>
              <Input
                value={member.person}
                onChange={(e) => onTeamMemberChange(index, 'person', e.target.value)}
                placeholder="Prénom Nom"
                className="border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Rôles */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <UserPlus className="h-3 w-3" />
                Rôle(s)
              </label>
              <div className="relative" style={{ zIndex: 1000 }}>
                <MultiSelect
                  options={roleOptions}
                  value={member.role}
                  onChange={(selected) => onTeamMemberChange(index, 'role', selected)}
                  placeholder="Sélectionnez les rôles"
                  onAddOption={onAddRoleOption}
                  className="border border-gray-200 focus:border-blue-400"
                />
              </div>
            </div>

            {/* Disponibilité */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Disponibilité
              </label>
              <div className="relative" style={{ zIndex: 999 }}>
                <Select
                  value={member.timeAvailable}
                  onValueChange={(value) => onTeamMemberChange(index, 'timeAvailable', value)}
                >
                  <SelectTrigger className="border border-gray-200 focus:border-blue-400">
                    <SelectValue placeholder="Temps disponible" />
                  </SelectTrigger>
                  <SelectContent 
                    side="bottom" 
                    align="start"
                    className="z-[1000] shadow-lg"
                  >
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add Button Mobile */}
      <Button
        onClick={onAddTeamMember}
        variant="outline"
        className={cn(
          "w-full h-12 text-sm text-gray-600 hover:text-blue-600",
          "hover:bg-blue-50 border-2 border-dashed border-gray-300",
          "hover:border-blue-400 transition-all duration-200 rounded-xl"
        )}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une personne
      </Button>
    </div>
  );

  return (
    <div className="w-full">
      <DesktopView />
      <MobileView />
    </div>
  );
};

export default NotionStyleTeamTable;