import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Users, Clock, UserPlus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
  person: string;
  role: string[];
  timeAvailable: string;
}

interface WorkingTeamTableProps {
  teamMembers: TeamMember[];
  roleOptions: { value: string; label: string }[];
  onTeamMemberChange: (index: number, field: string, value: any) => void;
  onAddTeamMember: () => void;
  onRemoveTeamMember: (index: number) => void;
  onAddRoleOption: (newOption: { value: string; label: string }) => void;
}

const WorkingTeamTable: React.FC<WorkingTeamTableProps> = ({
  teamMembers,
  roleOptions,
  onTeamMemberChange,
  onAddTeamMember,
  onRemoveTeamMember,
  onAddRoleOption,
}): JSX.Element => {
  const [openRoleSelectors, setOpenRoleSelectors] = useState<Set<number>>(new Set());
  const [openTimeSelectors, setOpenTimeSelectors] = useState<Set<number>>(new Set());
  const [newRoleInputs, setNewRoleInputs] = useState<{ [key: number]: string }>({});

  const timeOptions = [
    { value: 'quelques_heures', label: 'Quelques heures/semaine' },
    { value: 'mi_temps', label: 'Mi-temps' },
    { value: 'temps_plein', label: 'Temps plein' },
    { value: 'variable', label: 'Variable' },
  ];

  const toggleRoleSelector = (index: number) => {
    const newSet = new Set(openRoleSelectors);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      // Fermer tous les autres
      newSet.clear();
      setOpenTimeSelectors(new Set());
      newSet.add(index);
    }
    setOpenRoleSelectors(newSet);
  };

  const toggleTimeSelector = (index: number) => {
    const newSet = new Set(openTimeSelectors);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      // Fermer tous les autres
      newSet.clear();
      setOpenRoleSelectors(new Set());
      newSet.add(index);
    }
    setOpenTimeSelectors(newSet);
  };

  const handleRoleToggle = (memberIndex: number, roleValue: string) => {
    const member = teamMembers[memberIndex];
    const currentRoles = member.role || [];
    const newRoles = currentRoles.includes(roleValue)
      ? currentRoles.filter(r => r !== roleValue)
      : [...currentRoles, roleValue];

    onTeamMemberChange(memberIndex, 'role', newRoles);
  };

  const handleTimeSelect = (memberIndex: number, timeValue: string) => {
    onTeamMemberChange(memberIndex, 'timeAvailable', timeValue);
    setOpenTimeSelectors(new Set());
  };

  const addNewRole = (memberIndex: number) => {
    const newRoleText = newRoleInputs[memberIndex]?.trim();
    if (newRoleText) {
      const newRoleValue = newRoleText.toLowerCase().replace(/\s+/g, '_');
      const newOption = { value: newRoleValue, label: newRoleText };

      if (!roleOptions.some(opt => opt.value === newRoleValue)) {
        onAddRoleOption(newOption);
      }

      handleRoleToggle(memberIndex, newRoleValue);
      setNewRoleInputs(prev => ({ ...prev, [memberIndex]: '' }));
    }
  };

  const getSelectedRolesText = (roles: string[]) => {
    if (!roles || roles.length === 0) return "Sélectionner les rôles";
    const selectedLabels = roles.map(roleValue =>
      roleOptions.find(opt => opt.value === roleValue)?.label || roleValue
    );
    return selectedLabels.length > 2
      ? `${selectedLabels.slice(0, 2).join(', ')} +${selectedLabels.length - 2}`
      : selectedLabels.join(', ');
  };

  const getSelectedTimeText = (timeValue: string) => {
    if (!timeValue) return "Disponibilité";
    const option = timeOptions.find(opt => opt.value === timeValue);
    return option ? option.label : timeValue;
  };

  // Fermer les dropdowns lors du clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setOpenRoleSelectors(new Set());
        setOpenTimeSelectors(new Set());
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Synchroniser les valeurs locales avec les props
  useEffect(() => {
    const newLocalValues: { [key: number]: string } = {};
    teamMembers.forEach((member, index) => {
      newLocalValues[index] = member.person;
    });
    setLocalPersonValues(newLocalValues);
  }, [teamMembers]);

  // Gestionnaire pour les changements de nom avec debounce
  const handlePersonChange = useCallback((index: number, value: string) => {
    setLocalPersonValues(prev => ({ ...prev, [index]: value }));

    // Debounce pour éviter les re-renders trop fréquents
    const timeoutId = setTimeout(() => {
      onTeamMemberChange(index, 'person', value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [onTeamMemberChange]);

  // Version desktop
  const DesktopView = () => (
    <div className="hidden md:block">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <div className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-4 flex items-center gap-3 text-sm font-medium text-slate-700">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              Personne
            </div>
            <div className="col-span-4 flex items-center gap-3 text-sm font-medium text-slate-700">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <UserPlus className="h-4 w-4 text-purple-600" />
              </div>
              Rôle(s)
            </div>
            <div className="col-span-3 flex items-center gap-3 text-sm font-medium text-slate-700">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              Disponibilité
            </div>
            <div className="col-span-1"></div>
          </div>
        </div>

        {/* Rows */}
        {teamMembers.map((member, index) => (
          <div key={index} className="border-b border-slate-100 last:border-b-0 px-6 py-4 hover:bg-slate-50/50 transition-all duration-200 group">
            <div className="grid grid-cols-12 gap-6 items-start">
              {/* Nom - CORRIGÉ avec gestion locale */}
              <div className="col-span-4">
                <Input
                  value={localPersonValues[index] || member.person}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLocalPersonValues(prev => ({ ...prev, [index]: value }));

                    // Debounce pour éviter les re-renders trop fréquents
                    const timeoutId = setTimeout(() => {
                      onTeamMemberChange(index, 'person', value);
                    }, 300);

                    return () => clearTimeout(timeoutId);
                  }}
                  placeholder="Prénom Nom"
                  className="border-0 bg-transparent px-3 py-2 text-sm hover:bg-white focus:bg-white focus:border focus:border-blue-300 focus:shadow-sm transition-all duration-200 rounded-lg w-full"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Rôles */}
              <div className="col-span-4 relative" data-dropdown>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRoleSelector(index);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200",
                    "border-0 bg-transparent hover:bg-white focus:bg-white focus:border focus:border-purple-300 focus:shadow-sm",
                    openRoleSelectors.has(index) && "bg-white border border-purple-300 shadow-sm"
                  )}
                >
                  <span className={cn(
                    "text-sm",
                    (!member.role || member.role.length === 0) && "text-slate-500"
                  )}>
                    {getSelectedRolesText(member.role)}
                  </span>
                </button>

                {/* Dropdown Rôles - Position relative avec z-index élevé */}
                {openRoleSelectors.has(index) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] p-3 min-w-[300px]">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {roleOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={member.role?.includes(option.value) || false}
                            onCheckedChange={() => handleRoleToggle(index, option.value)}
                            className="border-slate-300"
                          />
                          <span className="text-sm text-slate-700">{option.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="border-t border-slate-200 pt-3 mt-3">
                      <div className="flex gap-2">
                        <Input
                          value={newRoleInputs[index] || ''}
                          onChange={(e) => setNewRoleInputs(prev => ({ ...prev, [index]: e.target.value }))}
                          placeholder="Nouveau rôle..."
                          className="text-xs border-slate-200"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addNewRole(index);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => addNewRole(index)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Disponibilité */}
              <div className="col-span-3 relative" data-dropdown>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTimeSelector(index);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200",
                    "border-0 bg-transparent hover:bg-white focus:bg-white focus:border focus:border-green-300 focus:shadow-sm",
                    openTimeSelectors.has(index) && "bg-white border border-green-300 shadow-sm"
                  )}
                >
                  <span className={cn(
                    "text-sm",
                    !member.timeAvailable && "text-slate-500"
                  )}>
                    {getSelectedTimeText(member.timeAvailable)}
                  </span>
                </button>

                {/* Dropdown Disponibilité */}
                {openTimeSelectors.has(index) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-[9998] p-2 min-w-[250px]">
                    {timeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleTimeSelect(index, option.value)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-3",
                          member.timeAvailable === option.value && "bg-green-50 text-green-700"
                        )}
                      >
                        <span className="text-sm">{option.label}</span>
                        {member.timeAvailable === option.value && (
                          <Check className="h-4 w-4 ml-auto text-green-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end">
                {teamMembers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTeamMember(index)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Button */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
          <Button
            onClick={onAddTeamMember}
            variant="ghost"
            className="w-full h-12 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 border-2 border-dashed border-slate-200 hover:border-blue-300 transition-all duration-200 rounded-xl"
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
        <div key={index} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium text-sm text-slate-700">Membre {index + 1}</span>
              </div>
              {teamMembers.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveTeamMember(index)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Nom */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Users className="h-3 w-3" />
                Nom complet
              </label>
              <Input
                value={member.person}
                onChange={(e) => onTeamMemberChange(index, 'person', e.target.value)}
                placeholder="Prénom Nom"
                className="border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl"
              />
            </div>

            {/* Rôles */}
            <div className="space-y-2" data-dropdown>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <UserPlus className="h-3 w-3" />
                Rôle(s)
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRoleSelector(index);
                }}
                className="w-full p-3 text-left border border-slate-200 rounded-xl hover:border-purple-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
              >
                <span className={cn(
                  "text-sm",
                  (!member.role || member.role.length === 0) && "text-slate-500"
                )}>
                  {getSelectedRolesText(member.role)}
                </span>
              </button>

              {openRoleSelectors.has(index) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  {roleOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={member.role?.includes(option.value) || false}
                        onCheckedChange={() => handleRoleToggle(index, option.value)}
                        className="border-slate-300"
                      />
                      <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                  ))}

                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <div className="flex gap-2">
                      <Input
                        value={newRoleInputs[index] || ''}
                        onChange={(e) => setNewRoleInputs(prev => ({ ...prev, [index]: e.target.value }))}
                        placeholder="Nouveau rôle..."
                        className="text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addNewRole(index);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => addNewRole(index)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Disponibilité */}
            <div className="space-y-2" data-dropdown>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Disponibilité
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTimeSelector(index);
                }}
                className="w-full p-3 text-left border border-slate-200 rounded-xl hover:border-green-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
              >
                <span className={cn(
                  "text-sm",
                  !member.timeAvailable && "text-slate-500"
                )}>
                  {getSelectedTimeText(member.timeAvailable)}
                </span>
              </button>

              {openTimeSelectors.has(index) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1">
                  {timeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleTimeSelect(index, option.value)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-3",
                        member.timeAvailable === option.value && "bg-green-50 text-green-700"
                      )}
                    >
                      <span className="text-sm">{option.label}</span>
                      {member.timeAvailable === option.value && (
                        <Check className="h-4 w-4 ml-auto text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Add Button Mobile */}
      <Button
        onClick={onAddTeamMember}
        variant="ghost"
        className="w-full h-14 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 border-2 border-dashed border-slate-200 hover:border-blue-300 transition-all duration-200 rounded-2xl"
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

export default WorkingTeamTable;