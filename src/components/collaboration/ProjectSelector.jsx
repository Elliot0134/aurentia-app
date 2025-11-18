import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Folder, Search, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProjectSelector = ({
  projects = [],
  selectedProjects = [],
  onChange,
  disabled = false,
  placeholder = "Sélectionner des projets...",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const triggerRef = React.useRef(null);

  // Filtrer les projets selon la recherche
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Obtenir les projets sélectionnés
  const selectedProjectsData = projects.filter(project =>
    selectedProjects.includes(project.id)
  );

  // Toggle project selection
  const toggleProject = (projectId) => {
    if (selectedProjects.includes(projectId)) {
      onChange(selectedProjects.filter(id => id !== projectId));
    } else {
      onChange([...selectedProjects, projectId]);
    }
  };

  // Remove project
  const removeProject = (projectId) => {
    onChange(selectedProjects.filter(id => id !== projectId));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between h-auto min-h-[40px] px-3 py-2",
              selectedProjectsData.length === 0 && "text-muted-foreground",
              className
            )}
          >
            <div className="flex flex-1 items-center overflow-hidden">
              {selectedProjectsData.length === 0 ? (
                <span className="truncate">{placeholder}</span>
              ) : (
                <span className="truncate">
                  {selectedProjectsData.length} projet{selectedProjectsData.length > 1 ? 's' : ''} sélectionné{selectedProjectsData.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          style={{ width: triggerRef.current?.offsetWidth }}
        >
          <div className="flex flex-col">
            {/* Search Input */}
            <div className="flex items-center border-b px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Rechercher un projet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Projects List */}
            <div className="max-h-[300px] overflow-y-auto">
              {filteredProjects.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Aucun projet trouvé
                </div>
              ) : (
                <div className="p-1">
                  {filteredProjects.map((project) => {
                    const isSelected = selectedProjects.includes(project.id);
                    return (
                      <div
                        key={project.id}
                        className={cn(
                          "flex items-start gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent transition-colors",
                          isSelected && "bg-accent/50"
                        )}
                        onClick={() => toggleProject(project.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleProject(project.id)}
                          className="mt-0.5"
                        />
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <Folder size={16} className="text-primary shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm break-words">{project.name}</div>
                            {project.description && (
                              <div className="text-xs text-muted-foreground break-words">
                                {project.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with count */}
            {selectedProjectsData.length > 0 && (
              <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                {selectedProjectsData.length} projet{selectedProjectsData.length > 1 ? 's' : ''} sélectionné{selectedProjectsData.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Affichage des projets sélectionnés sous forme de badges */}
      {selectedProjectsData.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedProjectsData.map(project => (
            <Badge
              key={project.id}
              variant="secondary"
              className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 pr-1"
            >
              <Folder size={10} className="mr-1" />
              <span className="max-w-[150px] truncate">{project.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeProject(project.id);
                }}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                disabled={disabled}
                type="button"
              >
                <X size={10} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;