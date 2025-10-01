import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  BookOpen
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
function DraggableRow({ row, className }: { row: Row<Adherent>; className?: string }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className={`group relative z-0 data-[state=selected]:bg-[#F5F5F5] data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 ${className || ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
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
        <div className="relative flex w-full items-center justify-between pr-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-aurentia-pink rounded-full flex items-center justify-center text-white font-semibold" style={{ fontSize: '0.6rem' }}>
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
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const adherent = row.original;
      return (
        <Badge variant="outline" className="px-1.5 font-normal">
          {getStatusLabel(adherent.status)}
        </Badge>
      );
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
                className="bg-aurentia-pink h-2 rounded-full"
                style={{ width: `${progress}%` }}
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
  const sortableId = useState(() => crypto.randomUUID())[0]
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = useMemo<UniqueIdentifier[]>(() => dataState?.map(({ id }) => id) ?? [], [dataState]);
  
  const handleEdit = (adherent: Adherent) => {
    toast.info(`Modification de l'adhérent : ${adherent.first_name} ${adherent.last_name}`);
    // Logique de modification à implémenter (ex: ouvrir un modal)
  };

  const handleDelete = (id: string) => {
    setDataState((prev) => prev.filter((adherent) => adherent.id !== id));
    toast.success("Adhérent supprimé avec succès.");
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
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
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
          <Button variant="outline" size="sm" className="bg-white">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
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
                    <DraggableRow key={row.id} row={row} className="h-8" />
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
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
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
      <Dialog open={!!selectedAdherent} onOpenChange={(isOpen) => !isOpen && setSelectedAdherent(null)}>
        <DialogContent className="sm:max-w-3xl">
          {selectedAdherent && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-aurentia-pink rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {selectedAdherent.first_name?.[0] || ''}{selectedAdherent.last_name?.[0] || ''}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedAdherent.first_name} {selectedAdherent.last_name}</DialogTitle>
                    <DialogDescription>
                      {selectedAdherent.email}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 py-4">
                {/* Informations de contact */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Informations générales</h3>
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
                </div>
                
                {/* Informations sur le projet */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Projet</h3>
                   <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-500 mt-1" />
                    <p className="text-sm">Description synthétique non disponible.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-5 h-5 text-gray-500" />
                    <a href="#" className="text-blue-500 hover:underline">Page des livrables</a>
                  </div>
                </div>

                {/* Historique */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Historique</h3>
                   <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-500 mt-1" />
                    <p className="text-sm">Aucun historique de conversation.</p>
                  </div>
                </div>

                {/* Formation */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Formation</h3>
                   <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-gray-500 mt-1" />
                    <p className="text-sm">Aucune information sur la formation.</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setSelectedAdherent(null)}>Fermer</Button>
              </DialogFooter>
            </>
          )}
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
      mentor_id: null
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
      mentor_id: "mentor-1"
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
      mentor_id: null
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
      mentor_id: "mentor-2"
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
      mentor_id: "mentor-1"
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
      mentor_id: null
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
      mentor_id: null
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
      mentor_id: "mentor-2"
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
            <div className="w-8 h-8 bg-aurentia-pink rounded-full flex items-center justify-center text-white font-semibold text-xs">
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
          <div className="flex items-center gap-3">
            <Button style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </div>

        {/* Liste des adhérents - Tableau avancé */}
        <Card>
          <CardHeader>
            <CardTitle>Tableau template</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AdvancedDataTable
              data={adherents}
              searchKey="first_name"
              searchPlaceholder="Rechercher par nom ou email..."
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
                            <div className="w-8 h-8 bg-aurentia-pink rounded-full flex items-center justify-center text-white font-semibold text-xs">
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
                                className="bg-aurentia-pink h-2 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
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
