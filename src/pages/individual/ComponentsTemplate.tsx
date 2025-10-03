import React, { useState, useEffect, useMemo, useRef, useId, useCallback } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ModularDataTable } from "@/components/ui/modular-data-table";
import { TableRow, TableCell, Table, TableHeader, TableHead, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { flexRender, Row, ColumnDef, useReactTable, getCoreRowModel, ColumnFiltersState, VisibilityState, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";
import { useSortable, SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { DndContext, closestCenter, DragEndEvent, UniqueIdentifier, useSensors, useSensor, MouseSensor, TouchSensor, KeyboardSensor } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { 
  GripVertical, 
  Check, 
  Loader, 
  X, 
  MoreHorizontal, 
  Trash2, 
  FileText, 
  Search, 
  Filter, 
  ChevronRight, 
  Eye,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  Calendar,
  Tag,
  ToggleLeft,
  CirclePlus,
  AlignLeft,
  MousePointer,
  Star,
  CheckSquare,
  DollarSign,
  MapPin,
  ExternalLink,
  SquareArrowOutUpRight
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCustomModalTabs } from "@/components/deliverables/shared/useCustomModalTabs";
import { DynamicLinkDropdown } from "@/components/ui/dynamic-link-dropdown";
import { 
  adherentsTableConfig, 
  AdherentData,
  mentorsTableConfig,
  MentorData,
  projetsTableConfig,
  ProjetData
} from "@/config/tables";

// Type pour les données de template
interface TemplateRowData {
  id: string;
  col1?: string;
  col2?: string;
  col3?: string;
  col4?: string;
  col5?: string;
  url?: string;
  dateCreated?: Date;
  labels?: string;
  progressValue?: number;
  relatedLinks?: Array<{ label: string; href: string }>;
  isLuthaneActive?: boolean;
  rating?: number;
  checkboxOptions?: string[];
  amount?: number;
  location?: { address: string; lat?: number; lng?: number };
  [key: string]: any;
}

// Composant de ligne draggable simplifié
function DraggableRow<TData extends TemplateRowData>({
  row,
  className,
  onRowClick // Ajout de onRowClick
}: {
  row: Row<TData>;
  className?: string;
  onRowClick?: (data: TData) => void; // Ajout de onRowClick
}) {
  const { transform, transition, setNodeRef, isDragging, attributes, listeners } = useSortable({
    id: row.original.id,
  })

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setHasScrolled(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isMobile && touchStart) {
      const deltaX = Math.abs(e.touches[0].clientX - touchStart.x);
      const deltaY = Math.abs(e.touches[0].clientY - touchStart.y);
      if (deltaX > 10 || deltaY > 10) {
        setHasScrolled(true);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isMobile) {
      setTouchStart(null);
    }
  };

  const handleRowClick = () => {
    if (isMobile && onRowClick && !hasScrolled) {
      onRowClick(row.original);
    }
  };

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className={`group relative z-0 hover:bg-[#F5F5F5] data-[state=selected]:bg-[#F5F5F5] data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 transition-colors duration-200 ${isMobile ? 'cursor-pointer' : ''} ${className || ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
      onMouseEnter={(e) => {
        // Synchroniser les colonnes sticky quand on survole la ligne
        const stickyCells = e.currentTarget.querySelectorAll('td[style*="position: sticky"]');
        stickyCells.forEach((cell: any) => {
          cell.style.backgroundColor = '#F5F5F5';
        });
      }}
      onMouseLeave={(e) => {
        // Retirer le hover des colonnes sticky quand on quitte la ligne
        const stickyCells = e.currentTarget.querySelectorAll('td[style*="position: sticky"]');
        const bgColor = row.getIsSelected() ? '#F5F5F5' : 'white';
        stickyCells.forEach((cell: any) => {
          cell.style.backgroundColor = bgColor;
        });
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        // Déclenche handleRowClick uniquement si c'est mobile et pas en cours de glisser-déposer
        if (isMobile && !isDragging) {
          handleRowClick();
        }
      }}
    >
      {row.getVisibleCells().map((cell) => {
        const isFirstColumn = (cell.column.columnDef as any).accessorKey === 'col1';
        const isDragColumn = cell.column.id === "drag";
        const isSelectColumn = cell.column.id === "select";
        const isStickyColumn = !isMobile && (isSelectColumn || isFirstColumn); // Pas de sticky en mobile
        
        // Calcul de la position left pour les colonnes sticky - parfaitement collées
        let leftPosition = 0;
        if (isFirstColumn) leftPosition = 0; // Col1 commence exactement à la fin de la colonne select
        
        if (isDragColumn) {
          return (
            <TableCell 
              key={cell.id} 
              className="py-2 px-4 transition-colors duration-200"
            >
              <DragHandle id={row.original.id} attributes={attributes} listeners={listeners} />
            </TableCell>
          );
        }
        
        return (
          <TableCell 
            key={cell.id} 
            className={`py-2 px-4 ${
              isStickyColumn
                ? `sticky z-10 transition-colors duration-200 ${
                    isFirstColumn 
                      ? 'relative after:absolute after:top-0 after:right-0 after:h-full after:w-[1px] after:bg-gradient-to-b after:from-gray-200 after:to-gray-300 after:shadow-[1px_0_3px_0px_rgba(0,0,0,0.1)] after:z-10' 
                      : ''
                  }`
                : 'transition-colors duration-200'
            }`}
            style={isStickyColumn ? { 
              position: 'sticky', 
              left: isSelectColumn ? '0px' : '40px', // Largeur checkbox ajustée = 40px
              backgroundColor: row.getIsSelected() ? '#F5F5F5' : 'white',
              minWidth: isSelectColumn ? '40px' : undefined, // Largeur minimum ajustée
              maxWidth: isSelectColumn ? '40px' : undefined  // Largeur maximum ajustée
            } : {}}
            onMouseEnter={(e) => {
              if (isStickyColumn) {
                e.currentTarget.style.backgroundColor = '#F5F5F5';
                // Déclencher le hover sur toute la ligne
                const tableRow = e.currentTarget.closest('tr');
                if (tableRow) {
                  tableRow.style.backgroundColor = '#F5F5F5';
                  // Mettre à jour toutes les colonnes sticky de cette ligne
                  const stickyCells = tableRow.querySelectorAll('td[style*="position: sticky"]');
                  stickyCells.forEach((cell: any) => {
                    cell.style.backgroundColor = '#F5F5F5';
                  });
                }
              }
            }}
            onMouseLeave={(e) => {
              if (isStickyColumn) {
                const bgColor = row.getIsSelected() ? '#F5F5F5' : 'white';
                e.currentTarget.style.backgroundColor = bgColor;
                // Retirer le hover de toute la ligne
                const tableRow = e.currentTarget.closest('tr');
                if (tableRow && !row.getIsSelected()) {
                  tableRow.style.backgroundColor = '';
                  // Mettre à jour toutes les colonnes sticky de cette ligne
                  const stickyCells = tableRow.querySelectorAll('td[style*="position: sticky"]');
                  stickyCells.forEach((cell: any) => {
                    cell.style.backgroundColor = bgColor;
                  });
                }
              }
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  )
}

// Composant de poignée de glissement séparé
function DragHandle({ id, attributes, listeners }: { id: UniqueIdentifier, attributes: any, listeners: any }) {
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <GripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// Colonnes pour le DataTable template
const getTemplateColumns = <TData extends TemplateRowData>(
  numColumns: number,
  handleOpenProfile: (data: TData) => void, // Ajout de handleOpenProfile
  isMobile: boolean = false // Ajout du paramètre isMobile
): ColumnDef<TData>[] => {
  const columns: ColumnDef<TData>[] = [
    {
      id: "drag",
      header: () => isMobile ? (
        <div className="flex items-center justify-center">
          <SquareArrowOutUpRight className="h-4 w-4" />
        </div>
      ) : null,
      cell: ({ row }) => {
        if (isMobile) {
          // En mobile, remplacer le drag par le bouton ouvrir
          return (
            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-gray-300 hover:border-[#F86E19] bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenProfile(row.original);
                }}
              >
                <SquareArrowOutUpRight className="h-4 w-4" />
              </Button>
            </div>
          );
        }
        
        // En desktop, garder le drag handle
        const { attributes, listeners } = useSortable({ id: row.original.id });
        return (
          <div className="flex items-center justify-center -mr-1">
            <DragHandle id={row.original.id} attributes={attributes} listeners={listeners} />
          </div>
        );
      },
      size: 1,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40, // Taille réduite pour rapprocher de la colonne drag
    },
  ];

  for (let i = 1; i <= numColumns; i++) {
    columns.push({
      accessorKey: `col${i}`,
      header: () => {
        if (i === 3) return <div className="flex items-center gap-2"><Mail className="h-4 w-4" />Email</div>;
        if (i === 4) return <div className="flex items-center gap-2"><Phone className="h-4 w-4" />Téléphone</div>;
        return `Colonne ${i}`;
      },
      cell: ({ row }) => {
        // Pour la première colonne, ajouter le bouton "Ouvrir" (seulement en desktop)
        if (i === 1) {
          return (
            <div className="flex items-center justify-between min-w-[180px] gap-2 bg-transparent">
              <div className="text-sm whitespace-nowrap flex-grow">{row.original[`col${i}`]}</div>
              {!isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity border-gray-300 hover:border-[#F86E19] flex-shrink-0 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation(); // Empêche l'événement de se propager à la ligne
                    handleOpenProfile(row.original);
                  }}
                >
                  Ouvrir
                </Button>
              )}
            </div>
          );
        }
        // Pour la colonne 3 (Email), rendre cliquable sans style bleu
        if (i === 3) {
          const email = row.original[`col${i}`];
          return (
            <a 
              href={`mailto:${email}`}
              className="flex items-center gap-2 text-sm text-gray-900 hover:text-gray-700 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="h-4 w-4 text-gray-400" />
              {email}
            </a>
          );
        }
        // Pour la colonne 4 (Téléphone), rendre cliquable sans style bleu
        if (i === 4) {
          const phone = row.original[`col${i}`];
          return (
            <a 
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-sm text-gray-900 hover:text-gray-700 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="h-4 w-4 text-gray-400" />
              {phone}
            </a>
          );
        }
        return <div className="text-sm whitespace-nowrap">{row.original[`col${i}`]}</div>;
      },
      size: i === 1 ? 500 : undefined, // Taille fixe pour la colonne 1 augmentée
      minSize: i === 1 ? 400 : undefined, // Taille minimale pour la colonne 1 augmentée
      meta: (i === 1 && !isMobile) ? { sticky: 'left' } : undefined, // Rendre la première colonne sticky seulement en desktop
    });
  }

  // Nouvelle colonne pour l'URL
  columns.push({
    accessorKey: "url",
    header: () => <div className="flex items-center gap-2"><Globe className="h-4 w-4" />URL</div>,
    cell: ({ row }) => {
      const url = row.original.url;
      if (!url) return <div className="flex items-center gap-2 text-sm text-gray-500"><Globe className="h-4 w-4 text-gray-400" />-</div>;
      
      return (
        <a 
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-900 hover:text-gray-700 cursor-pointer max-w-[150px] truncate"
          onClick={(e) => e.stopPropagation()}
          title={url}
        >
          <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{url}</span>
        </a>
      );
    },
    size: 150,
  });

  // Nouvelle colonne pour la date
  columns.push({
    accessorKey: "dateCreated",
    header: () => <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />Date</div>,
    cell: ({ row }) => {
      const [date, setDate] = useState<Date | undefined>(row.original.dateCreated);
      const [isOpen, setIsOpen] = useState(false);

      return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="text-sm text-gray-900 hover:text-gray-700 hover:bg-[#F3F4F6] h-auto p-1 font-normal"
              onClick={(e) => e.stopPropagation()}
            >
              {date ? date.toLocaleDateString('fr-FR') : 'Sélectionner'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                setIsOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );
    },
    size: 120,
  });

  // Nouvelle colonne pour les étiquettes (cliquable)
  columns.push({
    accessorKey: "labels",
    header: () => <div className="flex items-center gap-2"><Tag className="h-4 w-4" />Etiquettes</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => {
      const [currentLabel, setCurrentLabel] = useState(row.original.labels || "Actif");
      const [isOpen, setIsOpen] = useState(false);
      const labelOptions = ["Actif", "En attente", "Inactif"];

      const getLabelDisplay = (label: string) => {
        let iconComponent;
        let iconBgColor = "";
        let iconColor = "";

        switch (label) {
          case "Actif":
            iconComponent = <Check className="h-2 w-2" />;
            iconBgColor = "bg-green-500";
            iconColor = "text-white";
            break;
          case "En attente":
            iconComponent = <Loader className="h-3 w-3" />;
            iconBgColor = "bg-transparent";
            iconColor = "text-gray-500";
            break;
          case "Inactif":
            iconComponent = <X className="h-2 w-2" />;
            iconBgColor = "bg-red-500";
            iconColor = "text-white";
            break;
          default:
            iconComponent = null;
            iconBgColor = "bg-gray-200";
            iconColor = "text-gray-700";
        }

        return { iconComponent, iconBgColor, iconColor };
      };

      const { iconComponent, iconBgColor, iconColor } = getLabelDisplay(currentLabel);

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <div className="cursor-pointer">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-white border border-[#E5E5E5] text-[#747474] whitespace-nowrap hover:border-[#F86E19] transition-colors">
                  {iconComponent && (
                    <span className={`flex items-center justify-center mr-1 ${currentLabel === 'En attente' ? '' : `rounded-lg ${iconBgColor}`} ${iconColor} ${currentLabel === 'En attente' ? 'h-3 w-3' : 'h-3 w-3'}`}>
                      {iconComponent}
                    </span>
                  )}
                  {currentLabel}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {labelOptions.map((option) => {
                      const { iconComponent: optionIcon, iconBgColor: optionBgColor, iconColor: optionIconColor } = getLabelDisplay(option);
                      return (
                        <CommandItem
                          key={option}
                          onSelect={() => {
                            setCurrentLabel(option);
                            setIsOpen(false);
                            toast.success(`Étiquette changée vers "${option}" pour ${row.original.col1}`);
                          }}
                          className="justify-start hover:!bg-[#F3F4F6] hover:!text-black data-[highlighted]:!bg-[#F3F4F6] data-[highlighted]:!text-black !bg-transparent !text-black"
                        >
                          <div className="flex items-center gap-2">
                            {optionIcon && (
                              <span className={`flex items-center justify-center ${option === 'En attente' ? '' : `rounded-lg ${optionBgColor}`} ${optionIconColor} ${option === 'En attente' ? 'h-3 w-3' : 'h-3 w-3'}`}>
                                {optionIcon}
                              </span>
                            )}
                            <span className="text-black">{option}</span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      );
    },
    size: 120,
  });

  // Nouvelle colonne pour la barre de progression
  columns.push({
    accessorKey: "progressValue",
    header: "Progression",
    cell: ({ row }) => {
      const progress = row.original.progressValue;
      if (typeof progress === 'number') {
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-gray-100 rounded-full h-2 w-28 shadow-inner">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#F86E19] to-[#E55A0F] transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 min-w-[2.5rem] text-right">{progress}%</span>
          </div>
        );
      }
      return <div className="text-sm text-gray-500">N/A</div>;
    },
    size: 180,
  });

  // Nouvelle colonne pour les liens dynamiques
  columns.push({
    accessorKey: "relatedLinks",
    header: "Liens Associés",
    cell: ({ row }) => {
      const links = row.original.relatedLinks;
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <DynamicLinkDropdown links={links || []} label={links && links.length > 0 ? "Voir les liens" : "Sélectionner"} />
        </div>
      );
    },
    size: 150,
  });

  // Nouvelle colonne pour l'interrupteur "Luthane"
  columns.push({
    accessorKey: "isLuthaneActive",
    header: () => <div className="flex items-center gap-2"><ToggleLeft className="h-4 w-4" />Luthane</div>,
    cell: ({ row }) => {
      const [isHovering, setIsHovering] = useState(false);
      const isLuthaneActive = row.original.isLuthaneActive ?? false;
      const [checked, setChecked] = useState(isLuthaneActive);

      // Effect pour synchroniser l'état local avec les props initiales
      useEffect(() => {
        setChecked(isLuthaneActive);
      }, [isLuthaneActive]);

      return (
        <div 
          className="relative flex items-center justify-center h-full"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <Switch
            checked={checked}
            onCheckedChange={(newChecked) => {
              setChecked(newChecked);
              // Ici, vous pouvez ajouter une logique pour mettre à jour l'état global ou appeler une API
              toast.success(`Luthane pour ${row.original.col1} ${newChecked ? 'activé' : 'désactivé'}`);
            }}
            className={cn(
              "data-[state=checked]:bg-[#F86E19] data-[state=unchecked]:bg-[#E0E0E0] transition-colors duration-200", // Orange Aurentia quand coché
              (isHovering && !checked) ? "bg-gray-300" : "", // Grille plus claire au survol quand éteint
            )}
          />
        </div>
      );
    },
    size: 80,
  })

  // Nouvelle colonne pour les boutons d'action
  columns.push({
    accessorKey: "actionButton",
    header: () => <div className="flex items-center gap-2"><MousePointer className="h-4 w-4" />Bouton</div>,
    cell: ({ row }) => {
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs bg-white border-gray-300 hover:bg-[#F3F4F6] hover:border-[#F86E19] hover:text-black transition-colors"
            onClick={() => {
              toast.success(`Action exécutée pour ${row.original.col1}`);
            }}
          >
            Action
          </Button>
        </div>
      );
    },
    size: 100,
  });

  // Nouvelle colonne Rating avec étoiles cliquables
  columns.push({
    accessorKey: "rating",
    header: () => <div className="flex items-center gap-2"><Star className="h-4 w-4" />Rating</div>,
    cell: ({ row }) => {
      const [rating, setRating] = useState(row.original.rating || 0);
      const [hoveredStar, setHoveredStar] = useState(0);

      return (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 cursor-pointer transition-colors ${
                star <= (hoveredStar || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => {
                setRating(star);
                toast.success(`Note ${star}/5 attribuée à ${row.original.col1}`);
              }}
            />
          ))}
        </div>
      );
    },
    size: 120,
  });

  // Nouvelle colonne Étiquettes multiples (simplifié)
  columns.push({
    accessorKey: "checkboxOptions",
    header: () => <div className="flex items-center gap-2"><Tag className="h-4 w-4" />Étiquettes</div>,
    cell: ({ row }) => {
      const allOptions = ['Urgent', 'Important', 'Suivi', 'Archive'];
      const [selectedOptions, setSelectedOptions] = useState<string[]>(row.original.checkboxOptions || []);
      const [isOpen, setIsOpen] = useState(false);

      const toggleOption = (option: string) => {
        if (selectedOptions.includes(option)) {
          setSelectedOptions(selectedOptions.filter(o => o !== option));
        } else {
          setSelectedOptions([...selectedOptions, option]);
        }
      };

      const getTagColor = (option: string) => {
        switch (option) {
          case 'Urgent':
            return 'bg-red-100 text-red-800';
          case 'Important':
            return 'bg-orange-100 text-orange-800';
          case 'Suivi':
            return 'bg-blue-100 text-blue-800';
          case 'Archive':
            return 'bg-gray-100 text-gray-800';
          default:
            return 'bg-blue-100 text-blue-800';
        }
      };

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <div className="cursor-pointer min-h-[28px] flex items-center w-full">
                {selectedOptions.length > 0 ? (
                  // Affichage des étiquettes sélectionnées avec retour à la ligne
                  <div className="flex flex-wrap gap-1 w-full">
                    {selectedOptions.map((option) => (
                      <span 
                        key={option}
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getTagColor(option)} whitespace-nowrap`}
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                ) : (
                  // Zone cliquable vide quand aucune étiquette
                  <div className="w-full h-[28px]"></div>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-0" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {allOptions.map((option) => (
                      <CommandItem
                        key={option}
                        onSelect={() => toggleOption(option)}
                        className="justify-start hover:!bg-[#F3F4F6] hover:!text-black data-[highlighted]:!bg-[#F3F4F6] data-[highlighted]:!text-black !bg-transparent !text-black"
                      >
                        <Checkbox
                          checked={selectedOptions.includes(option)}
                          className="mr-2"
                        />
                        <span className="text-black">{option}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      );
    },
    size: 250,
  });

  // Nouvelle colonne Montant (Devise)
  columns.push({
    accessorKey: "amount",
    header: () => <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" />Montant</div>,
    cell: ({ row }) => {
      const amount = row.original.amount;
      
      return (
        <div className="text-sm font-medium">
          {amount !== undefined ? (
            <span className="text-black">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              }).format(amount)}
            </span>
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </div>
      );
    },
    size: 100,
  });

  // Nouvelle colonne Géolocalisation
  columns.push({
    accessorKey: "location",
    header: () => <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />Localisation</div>,
    cell: ({ row }) => {
      const location = row.original.location;
      
      if (!location?.address) {
        return <div className="text-sm text-gray-500">-</div>;
      }

      const handleOpenMaps = () => {
        const query = encodeURIComponent(location.address);
        const url = `https://maps.google.com/maps?q=${query}`;
        window.open(url, '_blank');
      };

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-xs hover:bg-[#F3F4F6] hover:text-black"
            onClick={handleOpenMaps}
          >
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="whitespace-nowrap">{location.address}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </div>
          </Button>
        </div>
      );
    },
    size: 200,
  });

  columns.push({
    id: "actions",
    cell: () => (
      <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted flex size-8 p-0 hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    size: 40,
  });

  return columns;
};

export function TemplateDataTable<TData extends TemplateRowData>({
  data,
}: {
  data: TData[]
}) {
  const [dataState, setDataState] = useState(() => data);
  const [selectedRowData, setSelectedRowData] = useState<TData | null>(null); // Renommé pour être générique
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false); // Nouvel état pour le dialogue de suppression
  
  // État pour la détection mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // États pour les filtres combobox (desktop)
  const [openEtiquettes, setOpenEtiquettes] = useState(false);
  const [openLuthane, setOpenLuthane] = useState(false);
  
  // États pour les filtres combobox (mobile)
  const [openEtiquettesMobile, setOpenEtiquettesMobile] = useState(false);
  const [openLuthaneMobile, setOpenLuthaneMobile] = useState(false);
  
  const [selectedEtiquettes, setSelectedEtiquettes] = useState<string[]>([]);
  const [selectedLuthane, setSelectedLuthane] = useState<string>("");

  const hasLuthaneColumn = useMemo(() => data.some(row => 'isLuthaneActive' in row), [data]);
  const sortableId = useId();
  // Les sensors sont recréés à chaque rendu pour s'assurer que DndContext réinitialise son état de détection.
  // Cela peut résoudre les problèmes où le drag-and-drop ne fonctionne plus après le premier déplacement.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }), // Ajout d'une contrainte d'activation pour le glisser-déposer
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }), // Contrainte pour le toucher
    useSensor(KeyboardSensor)
  );
  // Tabs logic for generic modal
  const tabs = ['details', 'related', 'history']; // Onglets génériques
  const {
    activeTab,
    isTransitioning,
    modalHeight,
    contentRef,
    modalRef,
    handleTabChange,
    resetTab
  } = useCustomModalTabs({
    tabs,
    defaultTab: 'details'
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedRowData) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [selectedRowData]);

  const handleModalClose = () => {
    setSelectedRowData(null);
    resetTab();
  };

  useEffect(() => {
    setDataState(data);
  }, [data]);

  // Détection des changements de taille d'écran
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => dataState?.map(({ id }) => id) || [],
    [dataState]
  );

  const handleOpenProfile = (dataItem: TData) => {
    setSelectedRowData(dataItem);
  };

  // Déterminer le nombre de colonnes dynamiquement à partir des données
  const numDynamicColumns = data.length > 0 ? Object.keys(data[0]).filter(key => key.startsWith('col')).length : 0;
  const columns = useMemo(() => getTemplateColumns<TData>(numDynamicColumns, handleOpenProfile, isMobile), [numDynamicColumns, handleOpenProfile, isMobile]);

  // Fonction pour obtenir les colonnes d'étiquettes et leurs valeurs uniques
  const table = useReactTable({
    data: dataState,
    columns,
    state: {
      rowSelection,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })


  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setDataState((prevDataState) => {
        const oldIndex = prevDataState.findIndex(item => item.id === active.id);
        const newIndex = prevDataState.findIndex(item => item.id === over.id);
        const newData = arrayMove(prevDataState, oldIndex, newIndex);
        return newData;
      });
    }
  }, [dataState]); // dataState est la dépendance pour s'assurer que la fonction est à jour
  
  return (
    <div className="w-full">
      <CardTitle className="mb-4 mx-4 lg:mx-6">Tableau template</CardTitle>
      {/* Version desktop : boutons côte à côte */}
      <div className="hidden md:flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={(table.getColumn(`col1`)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(`col1`)?.setFilterValue(event.target.value)
              }
              className="max-w-sm pl-8 h-8"
            />
          </div>
          
          {/* Filtre par étiquettes */}
          <Popover open={openEtiquettes} onOpenChange={setOpenEtiquettes}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openEtiquettes}
                className="h-8 justify-start bg-white hover:bg-[#F3F4F6] hover:text-black focus:ring-0 focus:ring-offset-0 border-dashed"
              >
                <CirclePlus className="h-4 w-4 text-gray-400 mr-2" />
                Etiquettes
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 custom-select-content-bg">
              <Command>
                <CommandInput placeholder="Rechercher étiquette..." className="h-9" />
                <CommandList>
                  <CommandEmpty>Aucune étiquette trouvée.</CommandEmpty>
                  <CommandGroup>
                    {['Actif', 'En attente', 'Inactif'].map((etiquette) => (
                      <CommandItem
                        key={etiquette}
                        value={etiquette}
                        onSelect={() => {
                          const newSelected = selectedEtiquettes.includes(etiquette)
                            ? selectedEtiquettes.filter(e => e !== etiquette)
                            : [...selectedEtiquettes, etiquette];
                          setSelectedEtiquettes(newSelected);
                          table.getColumn('labels')?.setFilterValue(newSelected.length > 0 ? newSelected : undefined);
                        }}
                        className="justify-start hover:!bg-[#F3F4F6] hover:!text-black data-[highlighted]:!bg-[#F3F4F6] data-[highlighted]:!text-black aria-selected:!bg-[#F3F4F6] aria-selected:!text-black"
                      >
                        <Checkbox
                          checked={selectedEtiquettes.includes(etiquette)}
                          className="mr-2"
                        />
                        {etiquette}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Filtre Luthane */}
          {hasLuthaneColumn && (
            <Popover open={openLuthane} onOpenChange={setOpenLuthane}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openLuthane}
                  className="h-8 justify-start bg-white hover:bg-[#F3F4F6] hover:text-black focus:ring-0 focus:ring-offset-0 border-dashed"
                >
                  <CirclePlus className="h-4 w-4 text-gray-400 mr-2" />
                  Luthane
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 custom-select-content-bg">
                <Command>
                  <CommandInput placeholder="Rechercher état..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>Aucun état trouvé.</CommandEmpty>
                    <CommandGroup>
                      {[
                        { value: "true", label: "Activé" },
                        { value: "false", label: "Désactivé" }
                      ].map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={(currentValue) => {
                            const newValue = currentValue === selectedLuthane ? "" : currentValue;
                            setSelectedLuthane(newValue);
                            table.getColumn('isLuthaneActive')?.setFilterValue(
                              newValue ? newValue === "true" : undefined
                            );
                            setOpenLuthane(false);
                          }}
                          className="justify-start hover:!bg-[#F3F4F6] hover:!text-black data-[highlighted]:!bg-[#F3F4F6] data-[highlighted]:!text-black aria-selected:!bg-[#F3F4F6] aria-selected:!text-black"
                        >
                          <Checkbox
                            checked={selectedLuthane === option.value}
                            className="mr-2"
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
          <div className="flex items-center gap-2">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirmDialog(true)} // Ouvre le dialogue de confirmation
                className="h-8"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white hover:bg-[#F3F4F6] hover:text-black focus:ring-0 focus:ring-offset-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 custom-select-content-bg">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  if (column.id === "drag" || column.id === "select" || column.id === "actions") {
                    return null;
                  }
                  
                  // Fonction pour obtenir l'icône et le texte de la colonne
                  const getColumnDisplay = () => {
                    const columnDef = column.columnDef as any;
                    const accessorKey = columnDef.accessorKey as string;
                    
                    if (accessorKey === "col3") {
                      return { icon: <Mail className="h-4 w-4" />, text: "Email" };
                    } else if (accessorKey === "col4") {
                      return { icon: <Phone className="h-4 w-4" />, text: "Téléphone" };
                    } else if (accessorKey === "url") {
                      return { icon: <Globe className="h-4 w-4" />, text: "URL" };
                    } else if (accessorKey === "dateCreated") {
                      return { icon: <Calendar className="h-4 w-4" />, text: "Date" };
                    } else if (accessorKey === "labels") {
                      return { icon: <Tag className="h-4 w-4" />, text: "Etiquettes" };
                    } else if (accessorKey === "progressValue") {
                      return { icon: <AlignLeft className="h-4 w-4" />, text: "Progression" };
                    } else if (accessorKey === "relatedLinks") {
                      return { icon: <AlignLeft className="h-4 w-4" />, text: "Liens Associés" };
                    } else if (accessorKey === "isLuthaneActive") {
                      return { icon: <ToggleLeft className="h-4 w-4" />, text: "Luthane" };
                    } else if (accessorKey === "actionButton") {
                      return { icon: <MousePointer className="h-4 w-4" />, text: "Bouton" };
                    } else if (accessorKey === "rating") {
                      return { icon: <Star className="h-4 w-4" />, text: "Rating" };
                    } else if (accessorKey === "checkboxOptions") {
                      return { icon: <Tag className="h-4 w-4" />, text: "Étiquettes" };
                    } else if (accessorKey === "amount") {
                      return { icon: <DollarSign className="h-4 w-4" />, text: "Montant" };
                    } else if (accessorKey === "location") {
                      return { icon: <MapPin className="h-4 w-4" />, text: "Localisation" };
                    } else if (accessorKey?.startsWith("col")) {
                      const colNumber = accessorKey.replace("col", "");
                      return { icon: <AlignLeft className="h-4 w-4" />, text: `Colonne ${colNumber}` };
                    }
                    
                    return { icon: <AlignLeft className="h-4 w-4" />, text: column.id };
                  };

                  const { icon, text } = getColumnDisplay();
                  
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize custom-select-item-bg justify-start"
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <Checkbox
                        checked={column.getIsVisible()}
                        className="mr-2"
                        aria-label={`Toggle column ${column.id}`}
                      />
                      <div className="flex items-center gap-2">
                        {icon}
                        {text}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
      </div>

      {/* Version mobile : boutons individuels sous la barre de recherche */}
      <div className="md:hidden w-[95%] mx-auto py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={(table.getColumn(`col1`)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(`col1`)?.setFilterValue(event.target.value)
            }
            className="pl-8"
          />
        </div>
        
        {/* Boutons de filtre sous la barre de recherche - VERSION MOBILE */}
        <div className="flex items-center gap-2 w-full">
          {/* Filtre par étiquettes - Bouton gauche */}
          <Popover open={openEtiquettesMobile} onOpenChange={setOpenEtiquettesMobile}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openEtiquettesMobile}
                className={`h-8 justify-start bg-white hover:bg-[#F3F4F6] hover:text-black focus:ring-0 focus:ring-offset-0 border-dashed ${hasLuthaneColumn ? 'flex-1' : 'w-full'}`}
              >
                <CirclePlus className="h-4 w-4 text-gray-400 mr-2" />
                Etiquettes
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 custom-select-content-bg" align="start" side="bottom" sideOffset={5}>
              <Command>
                <CommandInput placeholder="Rechercher étiquette..." className="h-9" />
                <CommandList>
                  <CommandEmpty>Aucune étiquette trouvée.</CommandEmpty>
                  <CommandGroup>
                    {['Actif', 'En attente', 'Inactif'].map((etiquette) => (
                      <CommandItem
                        key={etiquette}
                        value={etiquette}
                        onSelect={() => {
                          const newSelected = selectedEtiquettes.includes(etiquette)
                            ? selectedEtiquettes.filter(e => e !== etiquette)
                            : [...selectedEtiquettes, etiquette];
                          setSelectedEtiquettes(newSelected);
                          table.getColumn('labels')?.setFilterValue(newSelected.length > 0 ? newSelected : undefined);
                        }}
                        className="justify-start hover:!bg-[#F3F4F6] hover:!text-black data-[highlighted]:!bg-[#F3F4F6] data-[highlighted]:!text-black aria-selected:!bg-[#F3F4F6] aria-selected:!text-black"
                      >
                        <Checkbox
                          checked={selectedEtiquettes.includes(etiquette)}
                          className="mr-2"
                        />
                        {etiquette}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Filtre Luthane - Bouton droite */}
          {hasLuthaneColumn && (
            <Popover open={openLuthaneMobile} onOpenChange={setOpenLuthaneMobile}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openLuthaneMobile}
                  className="h-8 justify-start bg-white hover:bg-[#F3F4F6] hover:text-black focus:ring-0 focus:ring-offset-0 border-dashed flex-1"
                >
                  <CirclePlus className="h-4 w-4 text-gray-400 mr-2" />
                  Luthane
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 custom-select-content-bg" align="end" side="bottom" sideOffset={5}>
                <Command>
                  <CommandInput placeholder="Rechercher état..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>Aucun état trouvé.</CommandEmpty>
                    <CommandGroup>
                      {[
                        { value: "true", label: "Activé" },
                        { value: "false", label: "Désactivé" }
                      ].map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={(currentValue) => {
                            const newValue = currentValue === selectedLuthane ? "" : currentValue;
                            setSelectedLuthane(newValue);
                            table.getColumn('isLuthaneActive')?.setFilterValue(
                              newValue ? newValue === "true" : undefined
                            );
                            setOpenLuthaneMobile(false);
                          }}
                          className="justify-start hover:!bg-[#F3F4F6] hover:!text-black data-[highlighted]:!bg-[#F3F4F6] data-[highlighted]:!text-black aria-selected:!bg-[#F3F4F6] aria-selected:!text-black"
                        >
                          <Checkbox
                            checked={selectedLuthane === option.value}
                            className="mr-2"
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
        
        {/* Bouton de visibilité des colonnes - VERSION MOBILE */}
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full h-8 justify-center bg-white hover:bg-[#F3F4F6] hover:text-black focus:ring-0 focus:ring-offset-0 border-dashed">
                <Eye className="h-4 w-4 mr-2" />
                Vue des colonnes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 custom-select-content-bg">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  if (column.id === "drag" || column.id === "select" || column.id === "actions") {
                    return null;
                  }
                  
                  // Fonction pour obtenir l'icône et le texte de la colonne
                  const getColumnDisplay = () => {
                    const columnDef = column.columnDef as any;
                    const accessorKey = columnDef.accessorKey as string;
                    
                    if (accessorKey === "col3") {
                      return { icon: <Mail className="h-4 w-4" />, text: "Email" };
                    } else if (accessorKey === "col4") {
                      return { icon: <Phone className="h-4 w-4" />, text: "Téléphone" };
                    } else if (accessorKey === "url") {
                      return { icon: <Globe className="h-4 w-4" />, text: "URL" };
                    } else if (accessorKey === "dateCreated") {
                      return { icon: <Calendar className="h-4 w-4" />, text: "Date" };
                    } else if (accessorKey === "labels") {
                      return { icon: <Tag className="h-4 w-4" />, text: "Etiquettes" };
                    } else if (accessorKey === "progressValue") {
                      return { icon: <AlignLeft className="h-4 w-4" />, text: "Progression" };
                    } else if (accessorKey === "relatedLinks") {
                      return { icon: <AlignLeft className="h-4 w-4" />, text: "Liens Associés" };
                    } else if (accessorKey === "isLuthaneActive") {
                      return { icon: <ToggleLeft className="h-4 w-4" />, text: "Luthane" };
                    } else if (accessorKey === "actionButton") {
                      return { icon: <MousePointer className="h-4 w-4" />, text: "Bouton" };
                    } else if (accessorKey === "rating") {
                      return { icon: <Star className="h-4 w-4" />, text: "Rating" };
                    } else if (accessorKey === "checkboxOptions") {
                      return { icon: <Tag className="h-4 w-4" />, text: "Étiquettes" };
                    } else if (accessorKey === "amount") {
                      return { icon: <DollarSign className="h-4 w-4" />, text: "Montant" };
                    } else if (accessorKey === "location") {
                      return { icon: <MapPin className="h-4 w-4" />, text: "Localisation" };
                    } else if (accessorKey?.startsWith("col")) {
                      const colNumber = accessorKey.replace("col", "");
                      return { icon: <AlignLeft className="h-4 w-4" />, text: `Colonne ${colNumber}` };
                    }
                    
                    return { icon: <AlignLeft className="h-4 w-4" />, text: column.id };
                  };

                  const { icon, text } = getColumnDisplay();
                  
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize custom-select-item-bg justify-start"
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <Checkbox
                        checked={column.getIsVisible()}
                        className="mr-2"
                        aria-label={`Toggle column ${column.id}`}
                      />
                      <div className="flex items-center gap-2">
                        {icon}
                        {text}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Bouton de suppression - VERSION MOBILE */}
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center justify-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirmDialog(true)}
              className="w-full h-8"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          </div>
        )}
      </div>
      <div className={`rounded-lg border overflow-x-auto ${isMobile ? 'w-[95%] mx-auto' : 'mx-4 lg:mx-6'}`}>
        {isMobile ? (
          // En mobile, pas de drag & drop
          <Table className="min-w-full">
            <TableHeader className="bg-[#F5F5F5] text-black sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isFirstColumn = (header.column.columnDef as any).accessorKey === 'col1';
                    const isDragColumn = header.column.id === "drag";
                    const isSelectColumn = header.column.id === "select";
                    // En mobile, aucune colonne ne doit être sticky
                    const isStickyColumn = !isMobile && (isSelectColumn || isFirstColumn);
                    
                    return (
                      <TableHead 
                        key={header.id} 
                        colSpan={header.colSpan} 
                        className="text-black font-medium whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row: Row<TData>) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="group relative z-0 hover:bg-[#F5F5F5] data-[state=selected]:bg-[#F5F5F5] transition-colors duration-200 cursor-pointer h-8"
                    onClick={() => handleOpenProfile(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-sm"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="h-8">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Aucun résultat.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          // En desktop, avec drag & drop
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table className="min-w-full">{/*Assure que le tableau prend toute la largeur*/}
              <TableHeader className="bg-[#F5F5F5] text-black sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const isFirstColumn = (header.column.columnDef as any).accessorKey === 'col1';
                      const isDragColumn = header.column.id === "drag";
                      const isSelectColumn = header.column.id === "select";
                      // En mobile, aucune colonne ne doit être sticky
                      const isStickyColumn = !isMobile && (isSelectColumn || isFirstColumn);
                      
                      return (
                        <TableHead 
                          key={header.id} 
                          colSpan={header.colSpan} 
                          className={`text-black font-medium whitespace-nowrap ${
                            isStickyColumn
                              ? `sticky z-20 bg-[#F5F5F5] ${
                                  isFirstColumn 
                                    ? 'relative after:absolute after:top-0 after:right-0 after:h-full after:w-[1px] after:bg-gradient-to-b after:from-gray-200 after:to-gray-300 after:shadow-[1px_0_3px_0px_rgba(0,0,0,0.1)] after:z-10' 
                                    : ''
                                }`
                              : ''
                          }`}
                          style={isStickyColumn ? { 
                            position: 'sticky', 
                            left: isSelectColumn ? '0px' : '40px', // Largeur checkbox ajustée = 40px
                            backgroundColor: '#F5F5F5',
                            minWidth: isSelectColumn ? '40px' : undefined, // Largeur minimum ajustée
                            maxWidth: isSelectColumn ? '40px' : undefined  // Largeur maximum ajustée
                          } : {}}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    key={dataIds.map(id => id.toString()).join('-')} // Ajout d'une clé pour forcer la réinitialisation du contexte
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row: Row<TData>) => (
                      <DraggableRow
                        key={row.id}
                        row={row}
                        className="h-8"
                        onRowClick={handleOpenProfile} // Ajout de onRowClick
                      />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow className="h-8">
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Aucun résultat.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        )}
      </div>
      {/* Contrôles de pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between px-4 lg:px-6 py-4">
        <div className="hidden md:block text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
        </div>
        <div className="flex w-full items-center justify-between md:w-auto md:justify-end md:space-x-6 lg:space-x-8">
          <div className="hidden md:flex items-center space-x-2">
            <p className="text-sm font-medium">Lignes par page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px] bg-[#F9F9F8] focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`} className="hover:bg-[#F3F4F6] data-[highlighted]:bg-[#F3F4F6]">
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full items-center justify-between md:w-auto md:justify-center md:gap-8">
            <div className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} sur{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {selectedRowData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50" onClick={handleModalClose}>
          <div
            ref={modalRef}
            className="absolute bg-white text-black rounded-xl shadow-2xl transform scale-95 opacity-0 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'scaleIn 0.3s ease-out forwards',
              height: '80vh',
              width: window.innerWidth <= 768 ? '90vw' : '70vw',
              transition: 'transform 0.3s ease-out',
              left: '50%',
              top: '50%',
              transformOrigin: 'center',
              transform: 'translate(-50%, -50%) scale(0.95)'
            }}
          >
            <div className="flex items-center space-x-4 p-6 pb-4">
              <div className="flex w-12 md:w-16 h-12 md:h-16 bg-aurentia-pink rounded-full items-center justify-center text-white font-bold text-lg md:text-2xl">
                {selectedRowData.col1?.[0] || ''}{selectedRowData.col2?.[0] || ''}
              </div>
              <div>
                <h3 className="text-2xl font-semibold">{selectedRowData.col1}</h3>
                <p className="text-gray-600">
                  {selectedRowData.col2}
                </p>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-100 bg-transparent overflow-x-auto">
              <button
                className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === 'details' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => handleTabChange('details')}
              >
                Détails
              </button>
              <button
                className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === 'related' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => handleTabChange('related')}
              >
                Lié
              </button>
              <button
                className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === 'history' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => handleTabChange('history')}
              >
                Historique
              </button>
            </div>

            {/* Tabs Content */}
            <div className="flex-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/60 via-white/40 via-white/20 to-transparent pointer-events-none z-20" />

              <div
                ref={scrollContainerRef}
                className="h-full overflow-y-auto p-6 pt-4 pb-4"
              >
                <div
                  ref={contentRef}
                  className={`${isTransitioning ? 'opacity-0 blur-sm transform translate-y-2' : 'opacity-100 blur-0 transform translate-y-0'}`}
                  style={{
                    transition: isTransitioning ? 'none' : 'opacity 0.4s ease, filter 0.4s ease, transform 0.4s ease'
                  }}
                >
                  {(() => {
                    switch (activeTab) {
                      case 'details':
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-4">
                              <h3 className="font-semibold text-lg">Informations générales</h3>
                              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                                <h4 className="text-sm font-semibold mb-2">Colonne 1</h4>
                                <p className="text-[#4B5563]">{selectedRowData.col1}</p>
                              </div>
                              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                                <h4 className="text-sm font-semibold mb-2">Colonne 2</h4>
                                <p className="text-[#4B5563]">{selectedRowData.col2}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-500" />
                                <span>{selectedRowData.col3 || "Non renseigné"}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-500" />
                                <span>{selectedRowData.col4 || "Non renseigné"}</span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="font-semibold text-lg">Statistiques</h3>
                              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                                <h4 className="text-sm font-semibold mb-2">Colonne 5</h4>
                                <p className="text-2xl font-bold text-[#F86E19]">{selectedRowData.col5}</p>
                              </div>
                              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                                <h4 className="text-sm font-semibold mb-2">Autre donnée</h4>
                                <p className="text-[#4B5563]">Exemple de donnée supplémentaire</p>
                              </div>
                            </div>
                          </div>
                        );
                      case 'related':
                        return (
                          <div className="space-y-6">
                            <h3 className="font-semibold text-lg">Éléments liés</h3>
                            <div className="bg-[#F9FAFB] rounded-md px-4 py-8 text-center">
                              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">Aucun élément lié</p>
                              <p className="text-sm text-gray-400 mt-1">Ce modèle n'a pas d'éléments liés par défaut.</p>
                            </div>
                          </div>
                        );
                      case 'history':
                        return (
                          <div className="space-y-6">
                            <h3 className="font-semibold text-lg">Historique</h3>
                            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                              <div className="flex items-start gap-3">
                                <MessageSquare className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                  <h4 className="font-semibold mb-2">Activités</h4>
                                  <p className="text-sm text-[#4B5563]">Aucun historique d'activité disponible.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      default:
                        return null;
                    }
                  })()}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/95 via-white/80 via-white/60 via-white/30 via-white/10 to-transparent pointer-events-none z-20" />
            </div>
          </div>

          <style>
            {`
              @keyframes scaleIn {
                from {
                  opacity: 0;
                  transform: translate(-50%, -50%) scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: translate(-50%, -50%) scale(1);
                }
              }
            `}
          </style>
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-[425px] w-[350px] rounded-xl md:rounded-lg">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-sm">
              Êtes-vous sûr de vouloir supprimer {table.getFilteredSelectedRowModel().rows.length} ligne(s) sélectionnée(s) ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-0 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDeleteConfirmDialog(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
                setDataState((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
                setRowSelection({});
                setShowDeleteConfirmDialog(false); // Ferme le dialogue après suppression
                toast.success(`${selectedIds.length} ligne(s) supprimée(s) avec succès.`);
              }}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const ComponentsTemplate = () => {
  // Données fictives pour démonstration avec des colonnes génériques
  const fakeData: TemplateRowData[] = [
    {
      id: "1",
      col1: "Donnée A1",
      col2: "Valeur 1",
      col3: "email1@example.com",
      col4: "0123456789",
      col5: "10",
      url: "https://app.aurentia.fr",
      dateCreated: new Date('2024-01-15'),
      labels: "Actif",
      progressValue: 75,
      relatedLinks: [
        { label: "Lien Google", href: "https://www.google.com" },
        { label: "Lien Aurentia", href: "https://www.aurentia.fr" },
      ],
      rating: 4,
      checkboxOptions: ["Urgent", "Suivi"],
      amount: 1250.50,
      location: { address: "75001 Paris, France", lat: 48.8566, lng: 2.3522 },
    },
    {
      id: "2",
      col1: "Donnée A2",
      col2: "Valeur 2",
      col3: "email2@example.com",
      col4: "9876543210",
      col5: "20",
      url: "https://app.aurentia.fr/dashboard",
      dateCreated: new Date('2024-02-20'),
      labels: "En attente",
      progressValue: 25,
      relatedLinks: [
        { label: "Lien LinkedIn", href: "https://www.linkedin.com" },
      ],
      rating: 2,
      checkboxOptions: ["Important"],
      amount: 890.75,
      location: { address: "69001 Lyon, France" },
    },
    {
      id: "3",
      col1: "Donnée A3",
      col2: "Valeur 3",
      col3: "email3@example.com",
      col4: "1122334455",
      col5: "30",
      url: "https://app.aurentia.fr/projects",
      dateCreated: new Date('2024-03-10'),
      labels: "Inactif",
      progressValue: 90,
      relatedLinks: [],
      rating: 5,
      checkboxOptions: [],
      amount: 2150.00,
      location: { address: "13001 Marseille, France" },
    },
    {
      id: "4",
      col1: "Donnée A4",
      col2: "Valeur 1",
      col3: "email4@example.com",
      col4: "6677889900",
      col5: "40",
      url: "https://app.aurentia.fr/analytics",
      dateCreated: new Date('2024-04-05'),
      labels: "Actif",
      progressValue: 50,
      relatedLinks: [
        { label: "Lien Github", href: "https://www.github.com" },
        { label: "Lien StackOverflow", href: "https://stackoverflow.com" },
        { label: "Lien Medium", href: "https://medium.com" },
      ],
      rating: 3,
      checkboxOptions: ["Urgent", "Important", "Suivi"],
      amount: 567.25,
      location: { address: "33000 Bordeaux, France" },
    },
    {
      id: "5",
      col1: "Donnée A5",
      col2: "Valeur 5",
      col3: "email5@example.com",
      col4: "1234567890",
      col5: "15",
      url: "https://app.aurentia.fr/profile",
      dateCreated: new Date('2024-05-12'),
      labels: "En attente",
      progressValue: 35,
      relatedLinks: [
        { label: "Lien Twitter", href: "https://www.twitter.com" },
      ],
      isLuthaneActive: true,
      rating: 1,
      checkboxOptions: ["Archive"],
      amount: 1890.99,
      location: { address: "59000 Lille, France" },
    },
    {
      id: "6",
      col1: "Donnée A6",
      col2: "Valeur 6",
      col3: "email6@example.com",
      col4: "9876543210",
      col5: "25",
      url: "https://app.aurentia.fr/settings",
      dateCreated: new Date('2024-06-18'),
      labels: "Actif",
      progressValue: 80,
      relatedLinks: [
        { label: "Lien Facebook", href: "https://www.facebook.com" },
        { label: "Lien Instagram", href: "https://www.instagram.com" },
      ],
      isLuthaneActive: false,
    },
    {
      id: "7",
      col1: "Donnée A7",
      col2: "Valeur 7",
      col3: "email7@example.com",
      col4: "5555666677",
      col5: "35",
      url: "https://app.aurentia.fr/reports",
      dateCreated: new Date('2024-07-25'),
      labels: "Inactif",
      progressValue: 10,
      relatedLinks: [],
      isLuthaneActive: true,
    },
    {
      id: "8",
      col1: "Donnée A8",
      col2: "Valeur 8",
      col3: "email8@example.com",
      col4: "4444333322",
      col5: "45",
      url: "https://app.aurentia.fr/team",
      labels: "Actif",
      progressValue: 95,
      relatedLinks: [
        { label: "Lien YouTube", href: "https://www.youtube.com" },
      ],
      isLuthaneActive: true,
    },
    {
      id: "9",
      col1: "Donnée A9",
      col2: "Valeur 9",
      col3: "email9@example.com",
      col4: "7777888899",
      col5: "55",
      url: "https://app.aurentia.fr/billing",
      labels: "En attente",
      progressValue: 60,
      relatedLinks: [
        { label: "Lien Pinterest", href: "https://www.pinterest.com" },
        { label: "Lien Behance", href: "https://www.behance.net" },
      ],
      isLuthaneActive: false,
    },
    {
      id: "10",
      col1: "Donnée A10",
      col2: "Valeur 10",
      col3: "email10@example.com",
      col4: "3333222211",
      col5: "65",
      url: "https://app.aurentia.fr/support",
      labels: "Actif",
      progressValue: 85,
      relatedLinks: [
        { label: "Lien Dribbble", href: "https://www.dribbble.com" },
      ],
      isLuthaneActive: true,
    },
    {
      id: "11",
      col1: "Donnée A11",
      col2: "Valeur 11",
      col3: "email11@example.com",
      col4: "8888999900",
      col5: "75",
      url: "https://app.aurentia.fr/admin",
      labels: "Inactif",
      progressValue: 20,
      relatedLinks: [],
      isLuthaneActive: false,
    },
    {
      id: "12",
      col1: "Donnée A12",
      col2: "Valeur 12",
      col3: "email12@example.com",
      col4: "2222111100",
      col5: "85",
      url: "https://app.aurentia.fr/integrations",
      labels: "En attente",
      progressValue: 45,
      relatedLinks: [
        { label: "Lien Slack", href: "https://www.slack.com" },
        { label: "Lien Discord", href: "https://www.discord.com" },
        { label: "Lien Notion", href: "https://www.notion.so" },
      ],
      isLuthaneActive: true,
    },
    {
      id: "13",
      col1: "Donnée A13",
      col2: "Valeur 13",
      col3: "email13@example.com",
      col4: "6666555544",
      col5: "95",
      url: "https://app.aurentia.fr/templates",
      labels: "Actif",
      progressValue: 70,
      relatedLinks: [
        { label: "Lien Figma", href: "https://www.figma.com" },
      ],
      isLuthaneActive: false,
    },
    {
      id: "14",
      col1: "Donnée A14",
      col2: "Valeur 14",
      col3: "email14@example.com",
      col4: "9999000011",
      col5: "105",
      url: "https://app.aurentia.fr/workflows",
      labels: "Inactif",
      progressValue: 5,
      relatedLinks: [
        { label: "Lien Spotify", href: "https://www.spotify.com" },
        { label: "Lien Apple Music", href: "https://music.apple.com" },
      ],
      isLuthaneActive: true,
    },
    {
      id: "15",
      col1: "Donnée A15",
      col2: "Valeur 15",
      col3: "email15@example.com",
      col4: "1111000099",
      col5: "115",
      url: "https://app.aurentia.fr/automation",
      labels: "En attente",
      progressValue: 55,
      relatedLinks: [
        { label: "Lien Netflix", href: "https://www.netflix.com" },
      ],
      isLuthaneActive: false,
    },
    {
      id: "16",
      col1: "Donnée A16",
      col2: "Valeur 16",
      col3: "email16@example.com",
      col4: "4444000077",
      col5: "125",
      url: "https://app.aurentia.fr/marketplace",
      labels: "Actif",
      progressValue: 88,
      relatedLinks: [
        { label: "Lien Amazon", href: "https://www.amazon.com" },
        { label: "Lien eBay", href: "https://www.ebay.com" },
        { label: "Lien Etsy", href: "https://www.etsy.com" },
      ],
      isLuthaneActive: true,
    },
    {
      id: "17",
      col1: "Donnée A17",
      col2: "Valeur 17",
      col3: "email17@example.com",
      col4: "7777000044",
      col5: "135",
      url: "https://app.aurentia.fr/api",
      labels: "Inactif",
      progressValue: 15,
      relatedLinks: [],
      isLuthaneActive: false,
    },
    {
      id: "18",
      col1: "Donnée A18",
      col2: "Valeur 18",
      col3: "email18@example.com",
      col4: "2222000055",
      col5: "145",
      url: "https://app.aurentia.fr/webhooks",
      labels: "En attente",
      progressValue: 40,
      relatedLinks: [
        { label: "Lien Zoom", href: "https://www.zoom.us" },
        { label: "Lien Teams", href: "https://teams.microsoft.com" },
      ],
      isLuthaneActive: true,
    },
    {
      id: "19",
      col1: "Donnée A19",
      col2: "Valeur 19",
      col3: "email19@example.com",
      col4: "8888000066",
      col5: "155",
      url: "https://app.aurentia.fr/monitoring",
      labels: "Actif",
      progressValue: 92,
      relatedLinks: [
        { label: "Lien WhatsApp", href: "https://www.whatsapp.com" },
      ],
      isLuthaneActive: false,
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Components Template</h1>
      <Card>
        <CardContent className="p-6">
          <TemplateDataTable
            data={fakeData}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentsTemplate;
