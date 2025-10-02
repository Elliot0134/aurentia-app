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
} from "lucide-react";

import { ProgressBar } from "@/components/ui/progress-bar";
import { DynamicLinkDropdown } from "@/components/ui/dynamic-link-dropdown";
import { Switch } from "@/components/ui/switch";
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
}: {
  row: Row<TData>;
  className?: string;
  onRowClick?: (data: TData) => void;
}) {
  const { transform, transition, setNodeRef, isDragging, attributes, listeners } =
    useSortable({
      id: row.original.id,
    });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
      className={`group relative z-0 data-[state=selected]:bg-[#F5F5F5] data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 ${
        isMobile ? "cursor-pointer" : ""
      } ${className || ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
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
      {row.getVisibleCells().map((cell) => {
        if (cell.column.id === "drag") {
          return (
            <TableCell key={cell.id} className="py-2 px-4">
              <DragHandle
                id={row.original.id}
                attributes={attributes}
                listeners={listeners}
              />
            </TableCell>
          );
        }
        return (
          <TableCell key={cell.id} className="py-2 px-4">
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
  isDragEnabled: boolean = true
): ColumnDef<TData>[] {
  const columns: ColumnDef<TData>[] = [];

  // Colonne drag - only if enabled and more than one item
  if (isDragEnabled) {
    columns.push({
      id: "drag",
      header: () => null,
      cell: ({ row }) => {
        const { attributes, listeners } = useSortable({ id: row.original.id });
        return (
          <div className="flex items-center justify-center -mr-2.5">
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
        <div className="flex items-center justify-center -ml-2.5">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div
          className="flex items-center justify-center -ml-2.5"
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
      size: 15,
    });
  }

  // Colonnes personnalisées
  config.columns.forEach((colConfig, index) => {
    columns.push({
      accessorKey: colConfig.accessorKey,
      header: colConfig.header,
      cell: ({ row }) => {
        const value = row.original[colConfig.accessorKey];
        
        // Si c'est la première colonne et modal activé, ajouter le bouton "Ouvrir"
        if (index === 0 && config.modalEnabled) {
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
    });
  });

  // Colonne des étiquettes si configurée
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

  // Colonne de progression si configurée
  if (config.hasProgressColumn) {
    columns.push({
      accessorKey: "progressValue",
      header: "Progression",
      cell: ({ row }) => {
        const progress = row.original.progressValue;
        if (typeof progress === "number") {
          return (
            <div className="flex items-center space-x-2">
              <ProgressBar value={progress} className="w-24" />
              <span className="text-sm text-gray-500">{progress}%</span>
            </div>
          );
        }
        return <div className="text-sm text-gray-500">N/A</div>;
      },
      size: 150,
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
    columns.push({
      accessorKey: config.hasSwitchColumn.accessorKey,
      header: config.hasSwitchColumn.header,
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
                "data-[state=checked]:bg-[#4CAF50] data-[state=unchecked]:bg-[#E0E0E0]"
              )}
              style={{
                backgroundColor: checked
                  ? undefined
                  : isHovering
                  ? "#D0D0D0"
                  : "#E0E0E0",
              }}
            />
          </div>
        );
      },
      size: 80,
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
    () => generateColumns<TData>(config, handleOpenModal, isDragEnabled),
    [config, isDragEnabled]
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
      <div className="rounded-lg border mx-4 lg:mx-6">
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
