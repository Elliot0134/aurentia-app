import { useEffect, useMemo, useState, useId, useRef, useCallback } from "react";
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
      ))}
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

  // États pour la détection du scroll
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fonction pour vérifier la position du scroll
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Peut scroller vers le haut si on n'est pas au début
    setCanScrollUp(scrollTop > 0);
    
    // Peut scroller vers le bas si on n'est pas à la fin
    setCanScrollDown(scrollTop < scrollHeight - clientHeight - 5); // 5px de marge
  }, []);

  // Effect pour vérifier le scroll initial et ajouter le listener
  useEffect(() => {
    if (selectedAdherent && scrollContainerRef.current) {
      // Vérifier la position initiale
      setTimeout(checkScrollPosition, 100); // petit délai pour s'assurer que le contenu est rendu

      const container = scrollContainerRef.current;
      container.addEventListener('scroll', checkScrollPosition);

      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, [selectedAdherent, activeTab, checkScrollPosition]);

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
    setCanScrollUp(false);
    setCanScrollDown(false);
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

          {/* Informations sur les résultats */}
          <div className="text-center text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} sur{" "}
            {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
          </div>

          {/* Numéro de page et boutons de navigation */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-center">
              <span className="text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} sur{" "}
                {table.getPageCount()}
              </span>
            </div>

            <div className="flex items-center justify-center space-x-2">
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
            </div>
          </div>
        </div>
      </div>
      {selectedAdherent && (
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
                {selectedAdherent.first_name?.[0] || ''}{selectedAdherent.last_name?.[0] || ''}
              </div>
              <div>
                <h3 className="text-2xl font-semibold">{selectedAdherent.first_name} {selectedAdherent.last_name}</h3>
                <p className="text-gray-600">
                  {selectedAdherent.email}
                </p>
              </div>

            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-100 bg-transparent overflow-x-auto">
              <button
                className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === 'profile' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => handleTabChange('profile')}
              >
                Informations générales
              </button>
              <button
                className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === 'projects' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => handleTabChange('projects')}
              >
                Onglet 2
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
              {/* Flou du haut pour indiquer scroll disponible - affiché seulement si on peut scroller vers le haut */}
              {canScrollUp && (
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white via-white/90 via-white/60 to-transparent pointer-events-none z-20 transition-opacity duration-300" />
              )}

              <div
                ref={scrollContainerRef}
                className="h-full overflow-y-auto p-6 pt-4 pb-4 shadow-inner"
                onScroll={checkScrollPosition}
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
                      case 'profile':
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Informations de contact */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-lg">Informations générales</h3>
                              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                                <h4 className="text-sm font-semibold mb-2">Statut</h4>
                                <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-normal ${
                                  selectedAdherent.status === "active"
                                    ? "text-green-700 bg-green-100 border-green-200"
                                    : selectedAdherent.status === "pending"
                                    ? "text-yellow-700 bg-yellow-100 border-yellow-200"
                                    : "text-red-700 bg-red-100 border-red-200"
                                }`}>
                                  <span className={`rounded-full p-0.5 mr-1 ${
                                    selectedAdherent.status === "active"
                                      ? "bg-green-500"
                                      : selectedAdherent.status === "pending"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}>
                                    {selectedAdherent.status === "active" && <Check className="w-2 h-2 text-white" />}
                                    {selectedAdherent.status === "pending" && <Loader className="w-2 h-2 text-white" />}
                                    {selectedAdherent.status === "inactive" && <X className="w-2 h-2 text-white" />}
                                  </span>
                                  {getStatusLabel(selectedAdherent.status)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-500" />
                                <span>{selectedAdherent.email}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-500" />
                                <span>{selectedAdherent.phone || "Non renseigné"}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-gray-500" />
                                <span>Non renseigné</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                <span>Non renseigné</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <UserCheck className="w-5 h-5 text-gray-500" />
                                <span>Mentor: {selectedAdherent.mentor_id ? "Assigné" : "Non assigné"}</span>
                              </div>
                            </div>

                            {/* Statistiques */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-lg">Statistiques</h3>
                              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                                <h4 className="text-sm font-semibold mb-2">Nombre de projets</h4>
                                <p className="text-2xl font-bold text-[#F86E19]">{selectedAdherent.project_count}</p>
                              </div>
                              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                                <h4 className="text-sm font-semibold mb-2">Progression globale</h4>
                                <div className="flex items-center gap-4">
                                  <div className="flex-1">
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                      <div
                                        className="h-3 rounded-full bg-[#F86E19]"
                                        style={{
                                          width: `${selectedAdherent.total_deliverables > 0
                                            ? Math.round((selectedAdherent.completed_deliverables / selectedAdherent.total_deliverables) * 100)
                                            : 0}%`
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <span className="text-sm font-medium">
                                    {selectedAdherent.total_deliverables > 0
                                      ? Math.round((selectedAdherent.completed_deliverables / selectedAdherent.total_deliverables) * 100)
                                      : 0}%
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {selectedAdherent.completed_deliverables}/{selectedAdherent.total_deliverables} livrables complétés
                                </p>
                              </div>
                              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                                <h4 className="text-sm font-semibold mb-2">Date d'adhésion</h4>
                                <p className="text-[#4B5563]">{new Date(selectedAdherent.joined_at).toLocaleDateString('fr-FR')}</p>
                              </div>
                              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                                <h4 className="text-sm font-semibold mb-2">Dernière activité</h4>
                                <p className="text-[#4B5563]">
                                  {selectedAdherent.last_activity
                                    ? new Date(selectedAdherent.last_activity).toLocaleDateString('fr-FR')
                                    : "Aucune activité récente"
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      case 'projects':
                        return (
                          <div className="space-y-6">
                            <h3 className="font-semibold text-lg">Projets actifs</h3>
                            {selectedAdherent.project_names && selectedAdherent.project_names.length > 0 ? (
                              <div className="grid gap-4">
                                {selectedAdherent.project_names.map((projectName, index) => (
                                  <div key={index} className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                                    <div className="flex items-start gap-3">
                                      <FileText className="w-5 h-5 text-[#F86E19] mt-1" />
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-[#4B5563]">{projectName}</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                          Projet {index + 1} sur {selectedAdherent.project_names.length}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                          <LinkIcon className="w-4 h-4 text-blue-500" />
                                          <a href="#" className="text-blue-500 hover:underline text-sm">Voir les livrables</a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {/* Contenu supplémentaire pour tester le scroll */}
                                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                                  <h4 className="font-semibold mb-2">Informations supplémentaires</h4>
                                  <p className="text-sm text-gray-600 mb-2">Ce contenu permet de tester le scroll dynamique dans le popup.</p>
                                  <p className="text-sm text-gray-600 mb-2">Quand il y a du contenu qui dépasse, les effets de flou apparaissent automatiquement.</p>
                                  <p className="text-sm text-gray-600 mb-2">L'effet de flou en haut indique qu'on peut scroller vers le haut.</p>
                                  <p className="text-sm text-gray-600 mb-2">L'effet de flou en bas indique qu'on peut scroller vers le bas.</p>
                                  <p className="text-sm text-gray-600">Ces effets sont totalement dynamiques et s'adaptent au contenu.</p>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-[#F9FAFB] rounded-md px-4 py-8 text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Aucun projet associé</p>
                                <p className="text-sm text-gray-400 mt-1">Cet adhérent n'a pas encore créé de projet.</p>
                              </div>
                            )}
                          </div>
                        );
                      case 'history':
                        return (
                          <div className="space-y-6">
                            <h3 className="font-semibold text-lg">Historique et formation</h3>
                            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                              <div className="flex items-start gap-3">
                                <MessageSquare className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                  <h4 className="font-semibold mb-2">Interactions</h4>
                                  <p className="text-sm text-[#4B5563]">Aucun historique de conversation disponible.</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                              <div className="flex items-start gap-3">
                                <BookOpen className="w-5 h-5 text-gray-500 mt-1" />
                                <div>
                                  <h4 className="font-semibold mb-2">Formation</h4>
                                  <p className="text-sm text-[#4B5563] mb-4">Aucune information sur la formation disponible.</p>
                                  {/* Contenu supplémentaire pour tester le scroll */}
                                  <div className="space-y-3">
                                    <p className="text-sm text-gray-600">Exemple de formations suggérées :</p>
                                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                      <li>• Formation en gestion de projet</li>
                                      <li>• Développement des compétences numériques</li>
                                      <li>• Communication et leadership</li>
                                      <li>• Stratégie d'entreprise</li>
                                      <li>• Marketing digital</li>
                                      <li>• Analyse financière</li>
                                      <li>• Gestion d'équipe</li>
                                      <li>• Innovation et créativité</li>
                                    </ul>
                                    <p className="text-sm text-gray-600 mt-4">
                                      Ce contenu additionnel permet de démontrer le comportement du scroll dynamique. 
                                      Les effets de flou apparaissent et disparaissent en fonction de la position de scroll.
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      C'est un système intuitif qui guide l'utilisateur visuellement pour comprendre 
                                      qu'il y a plus de contenu disponible.
                                    </p>
                                  </div>
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

              {/* Flou du bas pour indiquer scroll disponible - affiché seulement si on peut scroller vers le bas */}
              {canScrollDown && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/90 via-white/60 to-transparent pointer-events-none z-20 transition-opacity duration-300" />
              )}
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
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px] w-[350px]">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-sm">
              Êtes-vous sûr de vouloir supprimer {table.getFilteredSelectedRowModel().rows.length} adhérent{table.getFilteredSelectedRowModel().rows.length > 1 ? 's' : ''} ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
                handleDelete(selectedIds);
              }}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const OrganisationAdherents = () => {
  const { id: organisationId } = useParams();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Données fictives pour démonstration
  const fakeAdherents: Adherent[] = [
    {
      id: "1",
      user_id: "user-1",
      organisation_id: organisationId || "org-1",
      first_name: "Marie",
      last_name: "Dupont",
      email: "marie.dupont@example.com",
      status: "active",
      project_count: 3,
      completed_deliverables: 8,
      total_deliverables: 10,
      joined_at: "2024-01-15T00:00:00.000Z",
      last_activity: "2025-01-10T00:00:00.000Z",
      mentor_id: null,
      project_names: ["TechNova Solutions", "E-commerce Plus", "MobileDev Corp"]
    },
    {
      id: "2",
      user_id: "user-2",
      organisation_id: organisationId || "org-1",
      first_name: "Jean",
      last_name: "Martin",
      email: "jean.martin@example.com",
      status: "active",
      project_count: 2,
      completed_deliverables: 5,
      total_deliverables: 8,
      joined_at: "2024-03-20T00:00:00.000Z",
      last_activity: "2025-01-09T00:00:00.000Z",
      mentor_id: "mentor-1",
      project_names: ["Innovatech Corp"]
    },
    {
      id: "3",
      user_id: "user-3",
      organisation_id: organisationId || "org-1",
      first_name: "Sophie",
      last_name: "Leroy",
      email: "sophie.leroy@example.com",
      status: "pending",
      project_count: 1,
      completed_deliverables: 2,
      total_deliverables: 5,
      joined_at: "2024-11-05T00:00:00.000Z",
      last_activity: "2025-01-08T00:00:00.000Z",
      mentor_id: null,
      project_names: ["DigitalConsult Corp"]
    },
    {
      id: "4",
      user_id: "user-4",
      organisation_id: organisationId || "org-1",
      first_name: "Pierre",
      last_name: "Durand",
      email: "pierre.durand@example.com",
      status: "inactive",
      project_count: 0,
      completed_deliverables: 1,
      total_deliverables: 3,
      joined_at: "2024-06-12T00:00:00.000Z",
      last_activity: "2024-12-15T00:00:00.000Z",
      mentor_id: "mentor-2",
      project_names: []
    },
    {
      id: "5",
      user_id: "user-5",
      organisation_id: organisationId || "org-1",
      first_name: "Anaïs",
      last_name: "Bertrand",
      email: "anais.bertrand@example.com",
      status: "active",
      project_count: 4,
      completed_deliverables: 12,
      total_deliverables: 15,
      joined_at: "2024-02-28T00:00:00.000Z",
      last_activity: "2025-01-10T00:00:00.000Z",
      mentor_id: "mentor-1",
      project_names: ["WebDev Solutions", "AutoMarket Corp", "DataVision Analytics", "LearningHub Platform"]
    },
    {
      id: "6",
      user_id: "user-6",
      organisation_id: organisationId || "org-1",
      first_name: "Luc",
      last_name: "Moreau",
      email: "luc.moreau@example.com",
      status: "active",
      project_count: 1,
      completed_deliverables: 4,
      total_deliverables: 6,
      joined_at: "2024-09-18T00:00:00.000Z",
      last_activity: "2025-01-07T00:00:00.000Z",
      mentor_id: null,
      project_names: ["APIDev Solutions"]
    },
    {
      id: "7",
      user_id: "user-7",
      organisation_id: organisationId || "org-1",
      first_name: "Chloé",
      last_name: "Girard",
      email: "chloe.girard@example.com",
      status: "pending",
      project_count: 0,
      completed_deliverables: 0,
      total_deliverables: 2,
      joined_at: "2024-12-01T00:00:00.000Z",
      last_activity: "2025-01-05T00:00:00.000Z",
      mentor_id: null,
      project_names: []
    },
    {
      id: "8",
      user_id: "user-8",
      organisation_id: organisationId || "org-1",
      first_name: "Thomas",
      last_name: "Roux",
      email: "thomas.roux@example.com",
      status: "active",
      project_count: 2,
      completed_deliverables: 7,
      total_deliverables: 9,
      joined_at: "2024-04-30T00:00:00.000Z",
      last_activity: "2025-01-09T00:00:00.000Z",
      mentor_id: "mentor-2",
      project_names: ["MobileTech Solutions", "AISmart Corp"]
    }
  ];

  // Utiliser les données Supabase quand disponible, sinon les données fictives
  const { adherents: realAdherents, loading } = useAdherents();
  const adherents = realAdherents.length > 0 ? realAdherents : fakeAdherents;

  const filteredAdherents = adherents.filter(adherent => {
    const matchesStatus = selectedStatus === 'all' || adherent.status === selectedStatus;
    return matchesStatus;
  });

  const getStatusColor = (status: Adherent['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Adherent['status']) => {
    const labels = {
      active: 'Actif',
      inactive: 'Inactif',
      pending: 'En attente'
    };
    return labels[status];
  };

  const stats = {
    total: adherents.length,
    active: adherents.filter(e => e.status === 'active').length,
    pending: adherents.filter(e => e.status === 'pending').length,
    avgProgress: adherents.length > 0 ? Math.round(
      adherents.reduce((sum, e) => sum + (e.completed_deliverables / e.total_deliverables), 0) / 
      adherents.length * 100
    ) : 0
  };

  // Colonnes pour le DataTable
  const columns: ColumnDef<Adherent>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "first_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom complet
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const adherent = row.original;
        const fullName = `${adherent.first_name} ${adherent.last_name}`.trim();
        const initials = `${adherent.first_name?.[0] || ''}${adherent.last_name?.[0] || ''}`.toUpperCase();
        
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs" style={{ backgroundColor: '#F86E19' }}>
              {initials || adherent.email.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{fullName || adherent.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status") as Adherent['status'];
        return (
          <Badge className={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "project_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Projets
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const count = row.getValue("project_count") as number;
        return <div className="text-center font-medium">{count}</div>;
      },
    },
    {
      accessorKey: "completed_deliverables",
      header: "Progression",
      cell: ({ row }) => {
        const adherent = row.original;
        const progressPercentage = adherent.total_deliverables > 0 
          ? Math.round((adherent.completed_deliverables / adherent.total_deliverables) * 100) 
          : 0;
        
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-aurentia-pink h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "joined_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date d'adhésion
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("joined_at") as string;
        return <div className="text-sm">{new Date(date).toLocaleDateString('fr-FR')}</div>;
      },
    },
    {
      accessorKey: "last_activity",
      header: "Dernière activité",
      cell: ({ row }) => {
        const lastActivity = row.getValue("last_activity") as string | undefined;
        if (!lastActivity) {
          return <span className="text-gray-400">-</span>;
        }
        return <div className="text-sm">{new Date(lastActivity).toLocaleDateString('fr-FR')}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const adherent = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Voir le profil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Contacter
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/organisation/mentors/assign?adherent=${adherent.id}`)}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {adherent.mentor_id ? 'Changer' : 'Assigner'} mentor
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const [selectedAdherents, setSelectedAdherents] = useState<Adherent[]>([]);

  const handleRowSelectionChange = (selectedRows: Adherent[]) => {
    setSelectedAdherents(selectedRows);
  };

  const bulkActions = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <Mail className="mr-2 h-4 w-4" />
        Contacter ({selectedAdherents.length})
      </Button>
      <Button variant="outline" size="sm">
        <UserCheck className="mr-2 h-4 w-4" />
        Assigner mentor ({selectedAdherents.length})
      </Button>
      <Button variant="destructive" size="sm">
        <Trash2 className="mr-2 h-4 w-4" />
        Supprimer ({selectedAdherents.length})
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des adhérents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Adhérents</h1>
            <p className="text-gray-600 text-base">
              Gérez les adhérents de votre organisation.
            </p>
          </div>

        </div>
      </div>

        {/* Liste des adhérents - Tableau avancé */}
        <Card>
          <CardContent className="p-6">
            <AdvancedDataTable
              data={adherents}
              searchKey="first_name"
              searchPlaceholder="Rechercher par nom"
            />
          </CardContent>
        </Card>

        {/* Nouveau tableau - Adhérants actifs */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Adhérants Actifs</CardTitle>
            <CardDescription>
              Liste simplifiée des adhérants actifs utilisant une table Shadcn classique.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher par nom..."
                  className="max-w-sm"
                />
              </div>
              <div className="text-sm text-gray-500">
                {adherents.filter(a => a.status === 'active').length} adhérants actifs
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHead className="w-[250px]">Nom complet</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Projets</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Date d'adhésion</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adherents.filter(adherent => adherent.status === 'active').map((adherent) => {
                    const fullName = `${adherent.first_name} ${adherent.last_name}`.trim();
                    const initials = `${adherent.first_name?.[0] || ''}${adherent.last_name?.[0] || ''}`.toUpperCase();
                    const progressPercentage = adherent.total_deliverables > 0
                      ? Math.round((adherent.completed_deliverables / adherent.total_deliverables) * 100)
                      : 0;

                    return (
                      <TableRow key={adherent.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs" style={{ backgroundColor: '#F86E19' }}>
                              {initials || adherent.email.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{fullName || adherent.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(adherent.status)}>
                            {getStatusLabel(adherent.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{adherent.project_count} projets</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{ width: `${progressPercentage}%`, backgroundColor: '#F86E19' }}
                              />
                            </div>
                            <span className="text-sm">{progressPercentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(adherent.joined_at).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ouvrir le menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir le profil
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Contacter
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {adherents.filter(a => a.status === 'active').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Aucun adhérant actif trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

export default OrganisationAdherents;
