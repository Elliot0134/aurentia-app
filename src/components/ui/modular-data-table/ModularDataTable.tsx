import { useMemo, useState, useId, useEffect, useRef, useCallback } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
  MoreHorizontal,
  Search,
  Trash2,
  Eye,
  Filter,
  Check,
  Loader,
  X,
  Globe,
  Calendar as CalendarIcon,
  Tag,
  Star,
  DollarSign,
  MapPin,
  SquareArrowOutUpRight,
  ToggleLeft,
  MousePointer,
} from "lucide-react";

import { ProgressBar } from "@/components/ui/progress-bar";
import { DynamicLinkDropdown } from "@/components/ui/dynamic-link-dropdown";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  Row,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCustomModalTabs } from "@/components/deliverables/shared/useCustomModalTabs";
import {
  BaseRowData,
  ModularTableConfig,
  RowAction,
  BulkAction,
  FilterConfig,
} from "./types";

// Composant de poignée de glissement
function DragHandle({
  id,
  attributes,
  listeners,
}: {
  id: UniqueIdentifier;
  attributes: any;
  listeners: any;
}) {
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
  );
}

// Composant de ligne draggable
function DraggableRow<TData extends BaseRowData>({
  row,
  className,
  onRowClick,
  isMobile,
  stickyFirstColumn,
}: {
  row: Row<TData>;
  className?: string;
  onRowClick?: (data: TData) => void;
  isMobile?: boolean;
  stickyFirstColumn?: boolean;
}) {
  const { transform, transition, setNodeRef, isDragging, attributes, listeners } =
    useSortable({
      id: row.original.id,
    });

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

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
      className={`group relative z-0 hover:bg-[#F5F5F5] data-[state=selected]:bg-[#F5F5F5] data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 transition-colors duration-200 ${
        isMobile ? "cursor-pointer" : ""
      } ${className || ""}`}
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
        if (isMobile && !isDragging) {
          handleRowClick();
        }
      }}
    >
      {row.getVisibleCells().map((cell, cellIndex) => {
        const isDragColumn = cell.column.id === "drag";
        const isSelectColumn = cell.column.id === "select";
        const isFirstDataColumn = cellIndex === 2; // After drag and select columns
        const isStickyColumn = !isMobile && stickyFirstColumn && (isSelectColumn || isFirstDataColumn);
        
        if (isDragColumn) {
          return (
            <TableCell key={cell.id} className="py-2 px-4">
              <div className="flex items-center justify-center -mr-2.5">
                <DragHandle
                  id={row.original.id}
                  attributes={attributes}
                  listeners={listeners}
                />
              </div>
            </TableCell>
          );
        }
        
        return (
          <TableCell 
            key={cell.id} 
            className={`py-2 px-4 ${
              isStickyColumn
                ? `sticky z-10 transition-colors duration-200 ${
                    isFirstDataColumn 
                      ? 'relative after:absolute after:top-0 after:right-0 after:h-full after:w-[1px] after:bg-gradient-to-b after:from-gray-200 after:to-gray-300 after:shadow-[1px_0_3px_0px_rgba(0,0,0,0.1)] after:z-10' 
                      : ''
                  }`
                : 'transition-colors duration-200'
            }`}
            style={isStickyColumn ? { 
              position: 'sticky', 
              left: isSelectColumn ? '0px' : '40px',
              backgroundColor: row.getIsSelected() ? '#F5F5F5' : 'white',
              minWidth: isSelectColumn ? '40px' : undefined,
              maxWidth: isSelectColumn ? '40px' : undefined
            } : {}}
            onMouseEnter={(e) => {
              if (isStickyColumn) {
                const currentCell = e.currentTarget;
                const row = currentCell.closest('tr');
                if (row) {
                  const stickyCells = row.querySelectorAll('td[style*="position: sticky"]');
                  stickyCells.forEach((cell: any) => {
                    cell.style.backgroundColor = '#F5F5F5';
                  });
                }
              }
            }}
            onMouseLeave={(e) => {
              if (isStickyColumn) {
                const currentCell = e.currentTarget;
                const row = currentCell.closest('tr');
                if (row) {
                  const isSelected = row.getAttribute('data-state') === 'selected';
                  const bgColor = isSelected ? '#F5F5F5' : 'white';
                  const stickyCells = row.querySelectorAll('td[style*="position: sticky"]');
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
  );
}

// Fonction pour générer les colonnes
function generateColumns<TData extends BaseRowData>(
  config: ModularTableConfig<TData>,
  handleOpenModal: (data: TData) => void,
  isDragEnabled: boolean = true,
  isMobile: boolean = false
): ColumnDef<TData>[] {
  const columns: ColumnDef<TData>[] = [];

  // Colonne drag - only if enabled and more than one item
  if (isDragEnabled) {
    columns.push({
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
                variant="ghost"
                size="icon"
                className="text-muted-foreground size-7 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(row.original);
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
    });
  }

  // Colonne select
  if (config.selectable !== false) {
    columns.push({
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
        <div
          className="flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    });
  }

  // Colonnes personnalisées
  config.columns.forEach((colConfig, index) => {
    columns.push({
      accessorKey: colConfig.accessorKey,
      header: colConfig.header,
      cell: ({ row }) => {
        const value = row.original[colConfig.accessorKey];
        
        // Si c'est la première colonne et modal activé, ajouter le bouton "Ouvrir" (seulement en desktop)
        if (index === 0 && config.modalEnabled && !isMobile) {
          return (
            <div className="flex items-center justify-between min-w-[180px] gap-2">
              <div className="text-sm whitespace-nowrap flex-grow">
                {colConfig.cell ? colConfig.cell(row.original) : value}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-[#F5F5F5] border-gray-300 hover:border-[#F86E19] flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(row.original);
                }}
              >
                Ouvrir
              </Button>
            </div>
          );
        }

        return (
          <div className="text-sm whitespace-nowrap">
            {colConfig.cell ? colConfig.cell(row.original) : value}
          </div>
        );
      },
      size: colConfig.size,
      minSize: colConfig.minSize,
      enableSorting: colConfig.enableSorting,
      enableHiding: colConfig.enableHiding,
      filterFn: colConfig.filterFn,
      meta: (index === 0 && config.stickyFirstColumn && !isMobile) ? { sticky: 'left' } : undefined,
    });
  });

  // Colonne URL si configurée
  if (config.hasUrlColumn) {
    const UrlIcon = config.hasUrlColumn.icon || Globe;
    columns.push({
      accessorKey: config.hasUrlColumn.accessorKey,
      header: () => <div className="flex items-center gap-2"><UrlIcon className="h-4 w-4" />URL</div>,
      cell: ({ row }) => {
        const url = row.original[config.hasUrlColumn!.accessorKey];
        if (!url) return <div className="flex items-center gap-2 text-sm text-gray-500"><UrlIcon className="h-4 w-4 text-gray-400" />-</div>;
        
        return (
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-900 hover:text-gray-700 cursor-pointer max-w-[150px] truncate"
            onClick={(e) => e.stopPropagation()}
            title={url}
          >
            <UrlIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{url}</span>
          </a>
        );
      },
      size: 150,
    });
  }

  // Colonne Date si configurée
  if (config.hasDateColumn) {
    const DateIcon = config.hasDateColumn.icon || CalendarIcon;
    columns.push({
      accessorKey: config.hasDateColumn.accessorKey,
      header: () => <div className="flex items-center gap-2"><DateIcon className="h-4 w-4" />Date</div>,
      cell: ({ row }) => {
        const [date, setDate] = useState<Date | undefined>(row.original[config.hasDateColumn!.accessorKey]);
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
                  if (config.hasDateColumn?.onChange) {
                    config.hasDateColumn.onChange(row.original, newDate);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      },
      size: 120,
    });
  }

  // Colonne des étiquettes si configurée (simple affichage)
  if (config.hasLabelsColumn) {
    columns.push({
      accessorKey: config.hasLabelsColumn.accessorKey,
      header: "Étiquettes",
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      cell: ({ row }) => {
        const label = row.original[config.hasLabelsColumn!.accessorKey];
        const labelCfg = config.hasLabelsColumn!.labelConfig[label];
        
        if (!labelCfg) return <span className="text-sm text-gray-500">{label}</span>;

        const IconComponent = labelCfg.icon;

        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-white border border-[#E5E5E5] text-[#747474] whitespace-nowrap">
            {IconComponent && (
              <span
                className={`flex items-center justify-center rounded-lg mr-1 ${labelCfg.iconBgColor} ${labelCfg.iconColor} h-4 w-4`}
              >
                <IconComponent className="h-3 w-3" />
              </span>
            )}
            {label}
          </span>
        );
      },
      size: 100,
    });
  }

  // Colonne des étiquettes éditables si configurée
  if (config.hasEditableLabelsColumn) {
    const LabelIcon = Tag;
    columns.push({
      accessorKey: config.hasEditableLabelsColumn.accessorKey,
      header: () => <div className="flex items-center gap-2"><LabelIcon className="h-4 w-4" />Etiquettes</div>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      cell: ({ row }) => {
        const [currentLabel, setCurrentLabel] = useState(row.original[config.hasEditableLabelsColumn!.accessorKey] || config.hasEditableLabelsColumn!.options[0]);
        const [isOpen, setIsOpen] = useState(false);
        const labelOptions = config.hasEditableLabelsColumn!.options;

        const getLabelDisplay = (label: string) => {
          const labelCfg = config.hasEditableLabelsColumn!.labelConfig[label];
          return labelCfg || { icon: null, iconBgColor: "bg-gray-200", iconColor: "text-gray-700" };
        };

        const { icon: IconComponent, iconBgColor, iconColor } = getLabelDisplay(currentLabel);

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <div className="cursor-pointer">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-white border border-[#E5E5E5] text-[#747474] whitespace-nowrap hover:border-[#F86E19] transition-colors">
                    {IconComponent && (
                      <span className={`flex items-center justify-center mr-1 ${iconBgColor} ${iconColor} h-3 w-3 ${iconBgColor !== 'bg-transparent' ? 'rounded-lg' : ''}`}>
                        <IconComponent className={`${iconBgColor === 'bg-transparent' ? 'h-3 w-3' : 'h-2 w-2'}`} />
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
                        const optionCfg = getLabelDisplay(option);
                        const OptionIcon = optionCfg.icon;
                        return (
                          <CommandItem
                            key={option}
                            onSelect={() => {
                              setCurrentLabel(option);
                              setIsOpen(false);
                              if (config.hasEditableLabelsColumn?.onChange) {
                                config.hasEditableLabelsColumn.onChange(row.original, option);
                              }
                            }}
                            className="justify-start hover:!bg-[#F3F4F6] hover:!text-black data-[highlighted]:!bg-[#F3F4F6] data-[highlighted]:!text-black !bg-transparent !text-black"
                          >
                            <div className="flex items-center gap-2">
                              {OptionIcon && (
                                <span className={`flex items-center justify-center ${optionCfg.iconBgColor} ${optionCfg.iconColor} h-3 w-3 ${optionCfg.iconBgColor !== 'bg-transparent' ? 'rounded-lg' : ''}`}>
                                  <OptionIcon className={`${optionCfg.iconBgColor === 'bg-transparent' ? 'h-3 w-3' : 'h-2 w-2'}`} />
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
  }

  // Colonne de progression si configurée
  if (config.hasProgressColumn) {
    columns.push({
      accessorKey: "progressValue",
      header: "Progression",
      cell: ({ row }) => {
        const progress = row.original.progressValue;
        if (typeof progress === "number") {
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
  }

  // Colonne des liens si configurée
  if (config.hasLinksColumn) {
    columns.push({
      accessorKey: "relatedLinks",
      header: "Liens Associés",
      cell: ({ row }) => {
        const links = row.original.relatedLinks;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DynamicLinkDropdown
              links={links || []}
              label={links && links.length > 0 ? "Voir les liens" : "Sélectionner"}
            />
          </div>
        );
      },
      size: 150,
    });
  }

  // Colonne Switch si configurée
  if (config.hasSwitchColumn) {
    const SwitchIcon = ToggleLeft;
    columns.push({
      accessorKey: config.hasSwitchColumn.accessorKey,
      header: () => <div className="flex items-center gap-2"><SwitchIcon className="h-4 w-4" />{config.hasSwitchColumn!.header}</div>,
      cell: ({ row }) => {
        const [isHovering, setIsHovering] = useState(false);
        const isActive = row.original[config.hasSwitchColumn!.accessorKey] ?? false;
        const [checked, setChecked] = useState(isActive);

        useEffect(() => {
          setChecked(isActive);
        }, [isActive]);

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
                config.hasSwitchColumn!.onChange(row.original, newChecked);
              }}
              className={cn(
                "data-[state=checked]:bg-[#F86E19] data-[state=unchecked]:bg-[#E0E0E0] transition-colors duration-200",
                (isHovering && !checked) ? "bg-gray-300" : ""
              )}
            />
          </div>
        );
      },
      size: 80,
    });
  }

  // Colonne Action Button si configurée
  if (config.hasActionButtonColumn) {
    const ActionIcon = config.hasActionButtonColumn.icon || MousePointer;
    const buttonLabel = config.hasActionButtonColumn.buttonLabel || "Action";
    columns.push({
      accessorKey: config.hasActionButtonColumn.accessorKey,
      header: () => <div className="flex items-center gap-2"><ActionIcon className="h-4 w-4" />Bouton</div>,
      cell: ({ row }) => {
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs bg-white border-gray-300 hover:bg-[#F3F4F6] hover:border-[#F86E19] hover:text-black transition-colors"
              onClick={() => {
                config.hasActionButtonColumn!.onClick(row.original);
              }}
            >
              {buttonLabel}
            </Button>
          </div>
        );
      },
      size: 100,
    });
  }

  // Colonne Rating si configurée
  if (config.hasRatingColumn) {
    const RatingIcon = Star;
    const maxRating = config.hasRatingColumn.maxRating || 5;
    columns.push({
      accessorKey: config.hasRatingColumn.accessorKey,
      header: () => <div className="flex items-center gap-2"><RatingIcon className="h-4 w-4" />Rating</div>,
      cell: ({ row }) => {
        const [rating, setRating] = useState(row.original[config.hasRatingColumn!.accessorKey] || 0);
        const [hoveredStar, setHoveredStar] = useState(0);

        return (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {[...Array(maxRating)].map((_, index) => {
              const star = index + 1;
              return (
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
                    if (config.hasRatingColumn?.onChange) {
                      config.hasRatingColumn.onChange(row.original, star);
                    }
                  }}
                />
              );
            })}
          </div>
        );
      },
      size: 120,
    });
  }

  // Colonne Étiquettes multiples si configurée
  if (config.hasMultiSelectLabelsColumn) {
    const MultiLabelIcon = Tag;
    columns.push({
      accessorKey: config.hasMultiSelectLabelsColumn.accessorKey,
      header: () => <div className="flex items-center gap-2"><MultiLabelIcon className="h-4 w-4" />Étiquettes</div>,
      cell: ({ row }) => {
        const allOptions = config.hasMultiSelectLabelsColumn!.options;
        const [selectedOptions, setSelectedOptions] = useState<string[]>(row.original[config.hasMultiSelectLabelsColumn!.accessorKey] || []);
        const [isOpen, setIsOpen] = useState(false);

        const toggleOption = (option: string) => {
          const newOptions = selectedOptions.includes(option)
            ? selectedOptions.filter((o) => o !== option)
            : [...selectedOptions, option];
          setSelectedOptions(newOptions);
          if (config.hasMultiSelectLabelsColumn?.onChange) {
            config.hasMultiSelectLabelsColumn.onChange(row.original, newOptions);
          }
        };

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 px-3 text-xs border-[#E5E5E5] hover:border-[#D0D0D0] bg-white"
                >
                  {selectedOptions.length > 0 ? `${selectedOptions.length} sélectionné(s)` : 'Sélectionner'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-1">
                  {allOptions.map((option) => (
                    <Button
                      key={option}
                      variant="ghost"
                      className="w-full justify-start text-sm h-8 px-2"
                      onClick={() => toggleOption(option)}
                    >
                      <Checkbox checked={selectedOptions.includes(option)} className="mr-2" />
                      {option}
                    </Button>
                  ))}
                </div>
                {selectedOptions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex flex-wrap gap-1">
                      {selectedOptions.map((option) => (
                        <span
                          key={option}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.hasMultiSelectLabelsColumn!.getTagColor(option)}`}
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        );
      },
      size: 250,
    });
  }

  // Colonne Montant (Devise) si configurée
  if (config.hasCurrencyColumn) {
    const CurrencyIcon = DollarSign;
    const currency = config.hasCurrencyColumn.currency || 'EUR';
    const locale = config.hasCurrencyColumn.locale || 'fr-FR';
    
    columns.push({
      accessorKey: config.hasCurrencyColumn.accessorKey,
      header: () => <div className="flex items-center gap-2"><CurrencyIcon className="h-4 w-4" />Montant</div>,
      cell: ({ row }) => {
        const amount = row.original[config.hasCurrencyColumn!.accessorKey];
        
        return (
          <div className="text-sm font-medium">
            {amount !== undefined ? (
              new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
              }).format(amount)
            ) : (
              <span className="text-gray-500">N/A</span>
            )}
          </div>
        );
      },
      size: 100,
    });
  }

  // Colonne Géolocalisation si configurée
  if (config.hasLocationColumn) {
    const LocationIcon = config.hasLocationColumn.icon || MapPin;
    columns.push({
      accessorKey: config.hasLocationColumn.accessorKey,
      header: () => <div className="flex items-center gap-2"><LocationIcon className="h-4 w-4" />Localisation</div>,
      cell: ({ row }) => {
        const location = row.original[config.hasLocationColumn!.accessorKey];
        
        if (!location?.address) {
          return <div className="text-sm text-gray-500">N/A</div>;
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
              className="h-8 px-2 text-sm text-gray-700 hover:text-[#F86E19] hover:bg-[#FFF5F0]"
              onClick={handleOpenMaps}
            >
              <LocationIcon className="h-4 w-4 mr-1" />
              {location.address}
            </Button>
          </div>
        );
      },
      size: 200,
    });
  }

  // Colonne des actions
  if (config.rowActions && config.rowActions.length > 0) {
    columns.push({
      id: "actions",
      cell: ({ row }) => {
        const visibleActions = config.rowActions!.filter(
          (action) => !action.show || action.show(row.original)
        );

        return (
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
                {visibleActions.map((action, idx) => {
                  const IconComponent = action.icon;
                  return (
                    <DropdownMenuItem
                      key={idx}
                      onClick={() => action.onClick(row.original)}
                      className={action.variant === "destructive" ? "text-red-600" : ""}
                    >
                      {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 40,
    });
  }

  return columns;
}

export interface ModularDataTableProps<TData extends BaseRowData> {
  data: TData[];
  config: ModularTableConfig<TData>;
  onDataChange?: (newData: TData[]) => void;
}

export function ModularDataTable<TData extends BaseRowData>({
  data,
  config,
  onDataChange,
}: ModularDataTableProps<TData>) {
  const [dataState, setDataState] = useState(() => data);
  const [selectedRowData, setSelectedRowData] = useState<TData | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: config.defaultPageSize || 10,
  });
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState<BulkAction<TData> | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const sortableId = useId();
  
  // Enable drag and drop based on config
  const isDragEnabled = config.draggable !== false;
  
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const tabs = config.modalTabs?.map((tab) => tab.id) || [];
  const {
    activeTab,
    isTransitioning,
    modalHeight,
    contentRef,
    modalRef,
    handleTabChange,
    resetTab,
  } = useCustomModalTabs({
    tabs,
    defaultTab: tabs[0],
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Détection des changements de taille d'écran
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedRowData) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [selectedRowData]);

  // Prevent scroll during drag
  useEffect(() => {
    if (isDragging) {
      const html = document.documentElement;
      const body = document.body;
      
      // Store original values
      const originalHtmlOverflow = html.style.overflow;
      const originalBodyOverflow = body.style.overflow;
      const originalHtmlTouchAction = html.style.touchAction;
      const originalBodyTouchAction = body.style.touchAction;
      
      // Disable scroll
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      html.style.touchAction = "none";
      body.style.touchAction = "none";
      
      // Prevent scroll events
      const preventScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      // Add listeners to prevent all scroll attempts
      window.addEventListener('scroll', preventScroll, { passive: false });
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });
      
      return () => {
        // Restore original values
        html.style.overflow = originalHtmlOverflow;
        body.style.overflow = originalBodyOverflow;
        html.style.touchAction = originalHtmlTouchAction;
        body.style.touchAction = originalBodyTouchAction;
        
        // Remove listeners
        window.removeEventListener('scroll', preventScroll);
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [isDragging]);

  const handleModalClose = () => {
    setSelectedRowData(null);
    resetTab();
  };

  useEffect(() => {
    setDataState(data);
  }, [data]);

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => dataState?.map(({ id }) => id) || [],
    [dataState]
  );

  const handleOpenModal = (dataItem: TData) => {
    setSelectedRowData(dataItem);
  };

  const columns = useMemo(
    () => generateColumns<TData>(config, handleOpenModal, isDragEnabled, isMobile),
    [config, isDragEnabled, isMobile]
  );

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
    enableRowSelection: config.selectable !== false,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setIsDragging(false);
      const { active, over } = event;
      if (active && over && active.id !== over.id) {
        setDataState((prevDataState) => {
          const oldIndex = prevDataState.findIndex((item) => item.id === active.id);
          const newIndex = prevDataState.findIndex((item) => item.id === over.id);
          const newData = arrayMove(prevDataState, oldIndex, newIndex);
          if (config.onReorder) {
            config.onReorder(newData);
          }
          if (onDataChange) {
            onDataChange(newData);
          }
          return newData;
        });
      }
    },
    [config, onDataChange]
  );

  const executeBulkAction = (action: BulkAction<TData>) => {
    const selectedRows = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original);
    action.onClick(selectedRows);
    setRowSelection({});
    setPendingBulkAction(null);
  };

  const searchKey = config.searchKeys?.[0] || config.columns[0]?.accessorKey;

  return (
    <div className="w-full">
      {config.title && <CardTitle className="mb-4 mx-4 lg:mx-6">{config.title}</CardTitle>}

      {/* Version desktop */}
      <div className="hidden md:flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="flex items-center gap-2">
          {config.searchable !== false && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={config.searchPlaceholder || "Rechercher..."}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="max-w-sm pl-8"
              />
            </div>
          )}

          {config.filters && config.filters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white hover:bg-[#F3F4F6] hover:text-black focus:ring-0 focus:ring-offset-0 flex items-center justify-center p-0 w-10 h-10 border border-input"
                  aria-label="Filter"
                >
                  <Filter className="h-4 w-4 text-black" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {config.filters.map((filter) => (
                  <DropdownMenu key={filter.id}>
                    <DropdownMenuTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="flex justify-between"
                      >
                        {filter.label}
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      sideOffset={5}
                      align="center"
                      className="w-48"
                    >
                      {filter.type === "checkbox" &&
                        filter.options?.map((option) => {
                          const currentFilter =
                            (table.getColumn(filter.id)?.getFilterValue() as any[]) || [];
                          const OptionIcon = option.icon;

                          return (
                            <DropdownMenuItem
                              key={option.value}
                              onSelect={(e) => e.preventDefault()}
                              onClick={() => {
                                const newFilter = currentFilter.includes(option.value)
                                  ? currentFilter.filter((v) => v !== option.value)
                                  : [...currentFilter, option.value];
                                table
                                  .getColumn(filter.id)
                                  ?.setFilterValue(
                                    newFilter.length > 0 ? newFilter : undefined
                                  );
                              }}
                            >
                              <Checkbox
                                checked={currentFilter.includes(option.value)}
                                className="mr-2"
                              />
                              {OptionIcon && <OptionIcon className="mr-2 h-4 w-4" />}
                              {option.label}
                            </DropdownMenuItem>
                          );
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {config.bulkActions &&
            config.bulkActions.length > 0 &&
            table.getFilteredSelectedRowModel().rows.length > 0 && (
              <>
                {config.bulkActions.map((action, idx) => {
                  const ActionIcon = action.icon;
                  return (
                    <Button
                      key={idx}
                      variant={action.variant || "default"}
                      size="sm"
                      onClick={() => {
                        if (action.confirmMessage) {
                          setPendingBulkAction(action);
                          setShowDeleteConfirmDialog(true);
                        } else {
                          executeBulkAction(action);
                        }
                      }}
                      className="ml-2"
                    >
                      {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                      {action.label} ({table.getFilteredSelectedRowModel().rows.length})
                    </Button>
                  );
                })}
              </>
            )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-white hover:bg-[#F3F4F6] hover:text-black focus:ring-0 focus:ring-offset-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 custom-select-content-bg"
            >
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  if (
                    column.id === "drag" ||
                    column.id === "select" ||
                    column.id === "actions"
                  ) {
                    return null;
                  }
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize custom-select-item-bg"
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <Checkbox checked={column.getIsVisible()} className="mr-2" />
                      {column.columnDef.header as string}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Version mobile */}
      <div className="md:hidden px-4 py-4 space-y-4">
        {config.searchable !== false && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={config.searchPlaceholder || "Rechercher..."}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {config.filters && config.filters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white hover:bg-[#F3F4F6] hover:text-black focus:ring-0 focus:ring-offset-0 flex items-center justify-center p-0 w-10 h-10 border border-input"
                  aria-label="Filter"
                >
                  <Filter className="h-4 w-4 text-black" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {config.filters.map((filter) => (
                  <DropdownMenu key={filter.id}>
                    <DropdownMenuTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="flex justify-between"
                      >
                        {filter.label}
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      sideOffset={5}
                      align="center"
                      className="w-48"
                    >
                      {filter.type === "checkbox" &&
                        filter.options?.map((option) => {
                          const currentFilter =
                            (table.getColumn(filter.id)?.getFilterValue() as any[]) || [];
                          const OptionIcon = option.icon;

                          return (
                            <DropdownMenuItem
                              key={option.value}
                              onSelect={(e) => e.preventDefault()}
                              onClick={() => {
                                const newFilter = currentFilter.includes(option.value)
                                  ? currentFilter.filter((v) => v !== option.value)
                                  : [...currentFilter, option.value];
                                table
                                  .getColumn(filter.id)
                                  ?.setFilterValue(
                                    newFilter.length > 0 ? newFilter : undefined
                                  );
                              }}
                            >
                              <Checkbox
                                checked={currentFilter.includes(option.value)}
                                className="mr-2"
                              />
                              {OptionIcon && <OptionIcon className="mr-2 h-4 w-4" />}
                              {option.label}
                            </DropdownMenuItem>
                          );
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-white hover:bg-[#F3F4F6] hover:text-black focus:ring-0 focus:ring-offset-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 custom-select-content-bg"
            >
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  if (
                    column.id === "drag" ||
                    column.id === "select" ||
                    column.id === "actions"
                  ) {
                    return null;
                  }
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize custom-select-item-bg"
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <Checkbox checked={column.getIsVisible()} className="mr-2" />
                      {column.columnDef.header as string}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {config.bulkActions &&
            config.bulkActions.length > 0 &&
            table.getFilteredSelectedRowModel().rows.length > 0 && (
              <>
                {config.bulkActions.map((action, idx) => {
                  const ActionIcon = action.icon;
                  return (
                    <Button
                      key={idx}
                      variant={action.variant || "default"}
                      size="sm"
                      onClick={() => {
                        if (action.confirmMessage) {
                          setPendingBulkAction(action);
                          setShowDeleteConfirmDialog(true);
                        } else {
                          executeBulkAction(action);
                        }
                      }}
                      className="flex-1"
                    >
                      {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                      {action.label} ({table.getFilteredSelectedRowModel().rows.length})
                    </Button>
                  );
                })}
              </>
            )}
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-lg border overflow-x-auto ${isMobile ? 'w-[95%] mx-auto' : 'mx-4 lg:mx-6'}`}>
        {isDragEnabled ? (
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setIsDragging(false)}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-[#F5F5F5] text-black sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className="text-black font-medium whitespace-nowrap"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    key={dataIds.map((id) => id.toString()).join("-")}
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row: Row<TData>) => (
                      <DraggableRow
                        key={row.id}
                        row={row}
                        className="h-8"
                        onRowClick={config.modalEnabled ? handleOpenModal : undefined}
                        isMobile={isMobile}
                        stickyFirstColumn={config.stickyFirstColumn}
                      />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow className="h-8">
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {config.emptyMessage || "Aucun résultat."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        ) : (
          <Table>
            <TableHeader className="bg-[#F5F5F5] text-black sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="text-black font-medium whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
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
                    className="h-8 group cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      if (config.modalEnabled) {
                        handleOpenModal(row.original);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: `${cell.column.getSize()}px`,
                          minWidth: `${cell.column.columnDef.minSize || 0}px`,
                        }}
                        className="overflow-hidden"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="h-8">
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {config.emptyMessage || "Aucun résultat."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
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
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] bg-[#F9F9F8] focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {(config.pageSizes || [10, 20, 30, 40, 50]).map((pageSize) => (
                  <SelectItem
                    key={pageSize}
                    value={`${pageSize}`}
                    className="hover:bg-[#F3F4F6] data-[highlighted]:bg-[#F3F4F6]"
                  >
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full items-center justify-between md:w-auto md:justify-center md:gap-8">
            <div className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
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

      {/* Modal */}
      {selectedRowData && config.modalEnabled && config.modalTabs && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50"
          onClick={handleModalClose}
        >
          <div
            ref={modalRef}
            className="absolute bg-white text-black rounded-xl shadow-2xl transform scale-95 opacity-0 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "scaleIn 0.3s ease-out forwards",
              height: "80vh",
              width: window.innerWidth <= 768 ? "90vw" : "70vw",
              transition: "transform 0.3s ease-out",
              left: "50%",
              top: "50%",
              transformOrigin: "center",
              transform: "translate(-50%, -50%) scale(0.95)",
            }}
          >
            {/* Header */}
            <div className="flex items-center space-x-4 p-6 pb-4">
              {config.modalAvatar && (
                <div
                  className={`flex w-12 md:w-16 h-12 md:h-16 ${
                    config.modalAvatar(selectedRowData).bgColor || "bg-aurentia-pink"
                  } rounded-full items-center justify-center text-white font-bold text-lg md:text-2xl`}
                >
                  {config.modalAvatar(selectedRowData).text}
                </div>
              )}
              <div>
                <h3 className="text-2xl font-semibold">
                  {config.modalTitle
                    ? config.modalTitle(selectedRowData)
                    : selectedRowData[config.columns[0].accessorKey]}
                </h3>
                {config.modalSubtitle && (
                  <p className="text-gray-600">{config.modalSubtitle(selectedRowData)}</p>
                )}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-100 bg-transparent overflow-x-auto">
              {config.modalTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "border-b-2 border-orange-500 text-orange-500"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tabs Content */}
            <div className="flex-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/60 via-white/40 via-white/20 to-transparent pointer-events-none z-20" />

              <div ref={scrollContainerRef} className="h-full overflow-y-auto p-6 pt-4 pb-4">
                <div
                  ref={contentRef}
                  className={`${
                    isTransitioning
                      ? "opacity-0 blur-sm transform translate-y-2"
                      : "opacity-100 blur-0 transform translate-y-0"
                  }`}
                  style={{
                    transition: isTransitioning
                      ? "none"
                      : "opacity 0.4s ease, filter 0.4s ease, transform 0.4s ease",
                  }}
                >
                  {config.modalTabs.find((tab) => tab.id === activeTab)?.render(selectedRowData)}
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

      {/* Dialog de confirmation */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-[425px] w-[350px]">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg">Confirmer l'action</DialogTitle>
            <DialogDescription className="text-sm">
              {pendingBulkAction?.confirmMessage ||
                `Êtes-vous sûr de vouloir effectuer cette action sur ${
                  table.getFilteredSelectedRowModel().rows.length
                } ligne(s) ?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowDeleteConfirmDialog(false);
                setPendingBulkAction(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant={pendingBulkAction?.variant === "destructive" ? "destructive" : "default"}
              size="sm"
              onClick={() => {
                if (pendingBulkAction) {
                  executeBulkAction(pendingBulkAction);
                }
                setShowDeleteConfirmDialog(false);
              }}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
