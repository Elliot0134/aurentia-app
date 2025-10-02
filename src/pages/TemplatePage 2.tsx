import React, { useEffect, useMemo, useState, useId, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomModalTabs } from '@/components/deliverables/shared/useCustomModalTabs';
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
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
  MoreHorizontal,
  Search,
  Plus,
  Eye,
  Edit,
  Mail,
  UserCheck,
  Trash2,
  Phone,
  Briefcase,
  MapPin,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  BookOpen,
  Check,
  Loader,
  X
} from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner";

import {
  ArrowUpDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

import { useAdherents } from '@/hooks/useOrganisationData';
import type { Adherent } from '@/types/organisationTypes';

// Fonctions utilitaires pour le statut
const getStatusLabel = (status: Adherent['status']) => {
  const labels = {
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente'
  };
  return labels[status];
};

// Composant DataTable avancé selon l'exemple fourni
function DraggableRow({
  row,
  className,
  onRowClick
}: {
  row: Row<Adherent>;
  className?: string;
  onRowClick?: (adherent: Adherent) => void;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
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
      // Si le mouvement dépasse 10px, considérer que c'est un scroll
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
      className={`group relative z-0 data-[state=selected]:bg-[#F5F5F5] data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 ${isMobile ? 'cursor-pointer' : ''} ${className || ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleRowClick}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="py-2 px-4">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      })}
    </TableRow>
  )
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

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

// Colonnes pour le DataTable avancé
const getAdvancedColumns = (
  handleEdit: (adherent: Adherent) => void,
  handleDelete: (id: string) => void,
  handleOpenProfile: (adherent: Adherent) => void
): ColumnDef<Adherent>[] => [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => (
      <div className="flex items-center justify-center -mr-2.5">
        <DragHandle id={row.original.id} />
      </div>
    ),
    size: 1,
  },
  {
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
      <div className="flex items-center justify-center -ml-2.5">
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
  },
  {
    accessorKey: "first_name",
    header: "Nom complet",
    cell: ({ row }) => {
      const adherent = row.original;
      const fullName = `${adherent.first_name} ${adherent.last_name}`.trim();
      return (
        <div className="relative flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold" style={{ fontSize: '0.6rem', backgroundColor: '#F86E19' }}>
              {adherent.first_name?.[0] || ''}{adherent.last_name?.[0] || ''}
            </div>
            <div className="text-sm">
              <div className="font-medium">{fullName || adherent.email}</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-[#F5F5F5] border-gray-300 hover:border-[#F86E19]"
            onClick={() => handleOpenProfile(adherent)}
          >
            Ouvrir
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "project_names",
    header: "Nom projet",
    cell: ({ row }) => {
      const adherent = row.original;
      if (!adherent.project_names || adherent.project_names.length === 0) {
        return <div className="text-gray-400 text-sm">-</div>;
      }

      // Afficher jusqu'à 2 noms de projets maximum
      const displayedProjects = adherent.project_names.slice(0, 2);
      const hasMore = adherent.project_names.length > 2;

      return (
        <div className="flex flex-col gap-1">
          {displayedProjects.map((projectName, index) => (
            <div key={index} className="text-sm text-gray-700 border-l-2 border-[#F86E19] pl-2">
              {projectName}
            </div>
          ))}
          {hasMore && (
            <div className="text-xs text-gray-500">
              +{adherent.project_names.length - 2} autres
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue === 'all') return true;
      return row.original.status === filterValue;
    },
    cell: ({ row }) => {
      const adherent = row.original;
      if (adherent.status === "active") {
        return (
          <span className="inline-flex items-center rounded-md border px-1 py-0.5 text-xs font-normal text-gray-700 gap-1">
            <span className="bg-green-500 rounded-full p-0.5">
              <Check className="w-2.5 h-2.5 text-white" />
            </span>
            {getStatusLabel(adherent.status)}
          </span>
        );
      } else if (adherent.status === "pending") {
        return (
          <span className="inline-flex items-center rounded-md border px-1 py-0.5 text-xs font-normal text-gray-700 gap-1">
            <Loader className="w-2.5 h-2.5 text-gray-500" />
            {getStatusLabel(adherent.status)}
          </span>
        );
      } else if (adherent.status === "inactive") {
        return (
          <span className="inline-flex items-center rounded-md border px-1 py-0.5 text-xs font-normal text-gray-700 gap-1">
            <span className="bg-red-500 rounded-full p-0.5">
              <X className="w-2.5 h-2.5 text-white" />
            </span>
            {getStatusLabel(adherent.status)}
          </span>
        );
      }
      return null;
    },
  },
  {
    accessorKey: "project_count",
    header: "Projets",
    cell: ({ row }) => (
      <div className="w-16 text-center">
        {row.original.project_count}
      </div>
    ),
  },
  {
    accessorKey: "completed_deliverables",
    header: "Progression",
    cell: ({ row }) => {
      const adherent = row.original;
      const progress = adherent.total_deliverables > 0
        ? Math.round((adherent.completed_deliverables / adherent.total_deliverables) * 100)
        : 0;
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{ width: `${progress}%`, backgroundColor: '#F86E19' }}
              />
            </div>
          </div>
          <span className="text-sm font-medium w-8 text-right">{progress}%</span>
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: "joined_at",
    header: "Date d'adhésion",
    cell: ({ row }) => {
      const date = row.original.joined_at;
      return <div className="text-sm">{new Date(date).toLocaleDateString('fr-FR')}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => toast.info('Fonctionnalité "Voir" à implémenter.')}>
              <Eye className="mr-2 h-4 w-4" />
              Voir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    size: 40,
  },
]

function AdvancedDataTable({
  data,
  searchKey = "first_name",
  searchPlaceholder = "Rechercher...",
}: {
  data: Adherent[]
  searchKey?: keyof Adherent
  searchPlaceholder?: string
}) {
  const [dataState, setDataState] = useState(() => data);
  const [selectedAdherent, setSelectedAdherent] = useState<Adherent | null>(null);
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const sortableId = useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  // Tabs logic for adherent modal
  const tabs = ['profile', 'projects', 'history'];
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
    defaultTab: 'profile'
  });

  // États pour la détection du scroll (maintenus pour compatibilité mais non utilisés)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Effect pour empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (selectedAdherent) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [selectedAdherent]);

  const handleModalClose = () => {
    setSelectedAdherent(null);
    resetTab();
  };

  // Synchroniser dataState avec data quand data change
  useEffect(() => {
    setDataState(data);
  }, [data]);

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => dataState?.map(({ id }) => id) || [],
    [dataState]
  );

  const handleEdit = (adherent: Adherent) => {
    toast.info(`Modification de l'adhérent : ${adherent.first_name} ${adherent.last_name}`);
    // Logique de modification à implémenter (ex: ouvrir un modal)
  };

  const handleDelete = (ids: string | string[]) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    setDataState((prev) => prev.filter((adherent) => !idsArray.includes(adherent.id)));
    setDeleteConfirmOpen(false);
    setRowSelection({}); // Clear selection after delete
    const count = idsArray.length;
    toast.success(`${count} adhérent${count > 1 ? 's' : ''} supprimé${count > 1 ? 's' : ''} avec succès.`);
  };

  const handleOpenProfile = (adherent: Adherent) => {
    setSelectedAdherent(adherent);
  };

	const columns = useMemo(() => getAdvancedColumns(handleEdit, handleDelete, handleOpenProfile), [dataState]);

  const table = useReactTable({
    data: dataState,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setDataState((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="w-full">
      <CardTitle className="mb-4 mx-4 lg:mx-6">Tableau template</CardTitle>
      {/* Version desktop : boutons côte à côte */}
      <div className="hidden md:flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey as string)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchKey as string)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              const filterValue = value === 'all' ? '' : value;
              table.getColumn('status')?.setFilterValue(filterValue);
            }}
          >
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white">
                Colonnes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  // Skip the drag and select columns
                  if (column.id === "drag" || column.id === "select") {
                    return null;
                  }
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize"
                      onSelect={(e) => e.preventDefault()} // Keep menu open
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <Checkbox
                        checked={column.getIsVisible()}
                        className="mr-2"
                        aria-label={`Toggle column ${column.id}`}
                      />
                      {column.id === 'first_name' ? 'Nom complet' :
                       column.id === 'project_names' ? 'Projet' :
                       column.id === 'status' ? 'Statut' :
                       column.id === 'project_count' ? 'Projets' :
                       column.id === 'completed_deliverables' ? 'Progression' :
                       column.id === 'joined_at' ? "Date d'adhésion" :
                       column.id}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="ml-2"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}

        </div>
      </div>

      {/* Version mobile : boutons en colonne */}
      <div className="md:hidden px-4 py-4 space-y-4">
        {/* Première ligne : Recherche et filtre statut */}
        <div className="flex items-center gap-4">
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey as string)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchKey as string)?.setFilterValue(event.target.value)
            }
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              const filterValue = value === 'all' ? '' : value;
              table.getColumn('status')?.setFilterValue(filterValue);
            }}
          >
            <SelectTrigger className="w-24 bg-white">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Deuxième ligne : Boutons Colonnes et Ajouter */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white flex-1">
                Colonnes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  // Skip the drag and select columns
                  if (column.id === "drag" || column.id === "select") {
                    return null;
                  }
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize"
                      onSelect={(e) => e.preventDefault()} // Keep menu open
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <Checkbox
                        checked={column.getIsVisible()}
                        className="mr-2"
                        aria-label={`Toggle column ${column.id}`}
                      />
                      {column.id === 'first_name' ? 'Nom complet' :
                       column.id === 'project_names' ? 'Projet' :
                       column.id === 'status' ? 'Statut' :
                       column.id === 'project_count' ? 'Projets' :
                       column.id === 'completed_deliverables' ? 'Progression' :
                       column.id === 'joined_at' ? "Date d'adhésion" :
                       column.id}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="flex-1"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}

        </div>
      </div>
      <div className="rounded-lg border mx-4 lg:mx-6">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          <Table>
            <TableHeader className="bg-[#F5F5F5] text-black sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan} className="text-black font-medium">
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
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow
                      key={row.id}
                      row={row}
                      className="h-8"
                      onRowClick={handleOpenProfile}
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
      </div>
      {/* Version desktop : contrôles côte à côte */}
      <div className="hidden md:flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Lignes par page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
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

      {/* Version mobile : contrôles de pagination en bas */}
      <div className="md:hidden px-4 py-4 border-t">
        <div className="flex flex-col space-y-4">
          {/* Sélection du nombre de lignes */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Lignes par page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.page
