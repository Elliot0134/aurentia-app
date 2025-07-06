import React, { useState } from 'react';
import { MultiSelect } from '@/components/ui/multi-select';
import { Badge } from '@/components/ui/badge';
import { Folder, Search, X } from 'lucide-react';

const ProjectSelector = ({ 
  projects = [], 
  selectedProjects = [], 
  onChange, 
  disabled = false,
  placeholder = "Sélectionner des projets...",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les projets selon la recherche
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Transformer les projets pour le MultiSelect
  const projectOptions = filteredProjects.map(project => ({
    value: project.id,
    label: (
      <div className="flex items-center gap-2">
        <Folder size={14} className="text-blue-500" />
        <div className="flex-1">
          <div className="font-medium text-sm">{project.name}</div>
          {project.description && (
            <div className="text-xs text-gray-500 truncate">{project.description}</div>
          )}
        </div>
      </div>
    ),
    description: project.description
  }));

  // Obtenir les projets sélectionnés
  const selectedProjectsData = projects.filter(project => 
    selectedProjects.includes(project.id)
  );

  // Trigger personnalisé pour afficher les projets sélectionnés
  const customTrigger = (
    <div className={`flex h-auto min-h-[36px] w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}>
      <div className="flex flex-1 items-center overflow-hidden">
        {selectedProjectsData.length === 0 ? (
          <span className="text-muted-foreground truncate">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selectedProjectsData.map(project => (
              <Badge 
                key={project.id} 
                variant="secondary" 
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <Folder size={10} className="mr-1" />
                {project.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(selectedProjects.filter(id => id !== project.id));
                  }}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  disabled={disabled}
                >
                  <X size={10} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="ml-2 flex items-center gap-1">
        {selectedProjectsData.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {selectedProjectsData.length}
          </Badge>
        )}
        <Search size={14} className="opacity-50" />
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <MultiSelect
        options={projectOptions}
        value={selectedProjects}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        trigger={customTrigger}
        className={className}
      />
      
      {/* Affichage des projets sélectionnés en mode liste */}
      {selectedProjectsData.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-600">
            Projets sélectionnés ({selectedProjectsData.length})
          </div>
          <div className="space-y-1">
            {selectedProjectsData.map(project => (
              <div 
                key={project.id}
                className="flex items-center justify-between bg-gray-50 rounded-md px-2 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Folder size={12} className="text-blue-500" />
                  <div>
                    <div className="font-medium">{project.name}</div>
                    {project.description && (
                      <div className="text-gray-500 text-xs">{project.description}</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onChange(selectedProjects.filter(id => id !== project.id))}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  disabled={disabled}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;