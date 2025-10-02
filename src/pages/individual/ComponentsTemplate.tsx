import { Card, CardContent } from "@/components/ui/card";
import { ModularDataTable } from "@/components/ui/modular-data-table";
import { 
  adherentsTableConfig, 
  AdherentData,
  mentorsTableConfig,
  MentorData,
  projetsTableConfig,
  ProjetData
} from "@/config/tables";

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
      className={`group relative z-0 data-[state=selected]:bg-[#F5F5F5] data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 ${isMobile ? 'cursor-pointer' : ''} ${className || ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
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
        if (cell.column.id === "drag") {
          return (
            <TableCell key={cell.id} className="py-2 px-4">
              <DragHandle id={row.original.id} attributes={attributes} listeners={listeners} />
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
  handleOpenProfile: (data: TData) => void // Ajout de handleOpenProfile
): ColumnDef<TData>[] => {
  const columns: ColumnDef<TData>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => {
        // Le DraggableRow passe déjà les attributes et listeners au DragHandle
        // Donc, ici, nous n'avons pas besoin de les passer explicitement.
        // Le DragHandle est un composant qui gère ses propres useSortable.
        // Correction: Les attributs et listeners doivent être passés au DragHandle
        const { attributes, listeners } = useSortable({ id: row.original.id });
        return (
          <div className="flex items-center justify-center -mr-2.5">
            <DragHandle id={row.original.id} attributes={attributes} listeners={listeners} />
          </div>
        );
      },
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
        <div className="flex items-center justify-center -ml-2.5" onClick={(e) => e.stopPropagation()}>
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
  ];

  for (let i = 1; i <= numColumns; i++) {
    columns.push({
      accessorKey: `col${i}`,
      header: `Colonne ${i}`,
      cell: ({ row }) => {
        // Pour la première colonne, ajouter le bouton "Ouvrir"
        if (i === 1) {
          return (
            <div className="flex items-center justify-between min-w-[180px] gap-2"> {/* min-w et gap ajoutés */}
              <div className="text-sm whitespace-nowrap flex-grow">{row.original[`col${i}`]}</div>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-[#F5F5F5] border-gray-300 hover:border-[#F86E19] flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation(); // Empêche l'événement de se propager à la ligne
                  handleOpenProfile(row.original);
                }}
              >
                Ouvrir
              </Button>
            </div>
          );
        }
        return <div className="text-sm whitespace-nowrap">{row.original[`col${i}`]}</div>;
      },
      size: i === 1 ? 500 : undefined, // Taille fixe pour la colonne 1 augmentée
      minSize: i === 1 ? 400 : undefined, // Taille minimale pour la colonne 1 augmentée
    });
  }

  // Nouvelle colonne pour les étiquettes
  columns.push({
    accessorKey: "labels",
    header: "Etiquettes",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => {
      const label = row.original.labels;
      let iconComponent;
      let iconBgColor = "";
      let iconColor = "";

      switch (label) {
        case "Actif":
          iconComponent = <Check className="h-3 w-3" />;
          iconBgColor = "bg-green-500";
          iconColor = "text-white";
          break;
        case "En attente":
          iconComponent = <Loader className="h-3 w-3" />; // Suppression de animate-spin
          iconBgColor = "bg-transparent";
          iconColor = "text-gray-500";
          break;
        case "Inactif":
          iconComponent = <X className="h-3 w-3" />;
          iconBgColor = "bg-red-500";
          iconColor = "text-white";
          break;
        default:
          iconComponent = null;
          iconBgColor = "bg-gray-200";
          iconColor = "text-gray-700";
      }

      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-white border border-[#E5E5E5] text-[#747474] whitespace-nowrap">
          {iconComponent && (
            <span className={`flex items-center justify-center rounded-lg mr-1 ${iconBgColor} ${iconColor} h-4 w-4`}>
              {iconComponent}
            </span>
          )}
          {label}
        </span>
      );
    },
    size: 100,
  });

  // Nouvelle colonne pour la barre de progression
  columns.push({
    accessorKey: "progressValue",
    header: "Progression",
    cell: ({ row }) => {
      const progress = row.original.progressValue;
      if (typeof progress === 'number') {
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
    header: "Luthane",
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
            // Remplacé 'className' par 'thumbClassName', car className est déjà utilisé par le wrapper de Switch
            // et nous devons cibler spécifiquement l'interrupteur interne.
            // Cependant, le composant Switch de shadcn ne semble pas avoir une prop `thumbClassName`,
            // nous devrons donc le styliser via Tailwind JIT ou un CSS personnalisé si nécessaire.
            // Pour l'instant, je vais ajouter une classe au conteneur du Switch si j'ai besoin de le styliser spécifiquement.
            checked={checked}
            onCheckedChange={(newChecked) => {
              setChecked(newChecked);
              // Ici, vous pouvez ajouter une logique pour mettre à jour l'état global ou appeler une API
              toast.success(`Luthane pour ${row.original.col1} ${newChecked ? 'activé' : 'désactivé'}`);
            }}
            className={cn(
              "data-[state=checked]:bg-[#4CAF50] data-[state=unchecked]:bg-[#E0E0E0]", // Couleurs par défaut
              (isHovering && !checked) ? "before:bg-gray-300" : "", // Grille plus claire au survol quand éteint
            )}
            style={{
              backgroundColor: checked ? undefined : (isHovering ? '#D0D0D0' : '#E0E0E0'), // Gris clair quand éteint, plus clair au survol
              // 'background-image': checked ? undefined : (isHovering ? 'linear-gradient(45deg, #E0E0E0 25%, transparent 25%, transparent 75%, #E0E0E0 75%, #E0E0E0), linear-gradient(45deg, #E0E0E0 25%, transparent 25%, transparent 75%, #E0E0E0 75%, #E0E0E0)' : undefined),
              // 'background-size': checked ? undefined : '10px 10px',
              // 'background-position': checked ? undefined : '0 0, 5px 5px',
            }}
          />
        </div>
      );
    },
    size: 80,
  })

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

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => dataState?.map(({ id }) => id) || [],
    [dataState]
  );

  const handleOpenProfile = (dataItem: TData) => {
    setSelectedRowData(dataItem);
  };

  // Déterminer le nombre de colonnes dynamiquement à partir des données
  const numDynamicColumns = data.length > 0 ? Object.keys(data[0]).filter(key => key.startsWith('col')).length : 0;
  const columns = useMemo(() => getTemplateColumns<TData>(numDynamicColumns, handleOpenProfile), [numDynamicColumns, handleOpenProfile]);

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
              className="max-w-sm pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white hover:bg-[#F3F4F6] hover:text-black focus:ring-0 focus:ring-offset-0 flex items-center justify-center p-0 w-10 h-10 border border-input" aria-label="Filter">
                <Filter className="h-4 w-4 text-black" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex justify-between">
                    Étiquette
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" sideOffset={5} align="center" className="w-48">
                  {['Actif', 'En attente', 'Inactif'].map(label => (
                    <DropdownMenuItem
                      key={label}
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => {
                        const currentFilter = table.getColumn('labels')?.getFilterValue() as string[] | undefined || [];
                        const newFilter = currentFilter.includes(label)
                          ? currentFilter.filter(l => l !== label)
                          : [...currentFilter, label];
                        table.getColumn('labels')?.setFilterValue(newFilter.length > 0 ? newFilter : undefined);
                      }}
                    >
                      <Checkbox
                        checked={(table.getColumn('labels')?.getFilterValue() as string[] | undefined || []).includes(label)}
                        className="mr-2"
                      />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {hasLuthaneColumn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex justify-between">
                    Luthane
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" sideOffset={5} align="center" className="w-48">
                  {['Activé', 'Désactivé'].map(status => {
                    const filterValue = status === 'Activé';
                    const currentFilter = table.getColumn('isLuthaneActive')?.getFilterValue();
                    
                    return (
                      <DropdownMenuItem
                        key={status}
                        onSelect={(e) => e.preventDefault()}
                        onClick={() => {
                          if (currentFilter === filterValue) {
                            table.getColumn('isLuthaneActive')?.setFilterValue(undefined);
                          } else {
                            table.getColumn('isLuthaneActive')?.setFilterValue(filterValue);
                          }
                        }}
                      >
                        <Checkbox
                          checked={currentFilter === filterValue}
                          className="mr-2"
                        />
                        {status}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirmDialog(true)} // Ouvre le dialogue de confirmation
              className="ml-2"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white hover:bg-[#F3F4F6] hover:text-black focus:ring-0 focus:ring-offset-0">
                <Eye className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" alignOffset={-20} className="w-56 custom-select-content-bg">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  if (column.id === "drag" || column.id === "select" || column.id === "actions") {
                    return null;
                  }
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize custom-select-item-bg"
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <Checkbox
                        checked={column.getIsVisible()}
                        className="mr-2"
                        aria-label={`Toggle column ${column.id}`}
                      />
                      {column.columnDef.header as string}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Version mobile : boutons en colonne */}
      <div className="md:hidden px-4 py-4 space-y-4">
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
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white hover:bg-[#F3F4F6] hover:text-black focus:ring-0 focus:ring-offset-0 flex items-center justify-center p-0 w-10 h-10 border border-input" aria-label="Filter">
                    <Filter className="h-4 w-4 text-black" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex justify-between">
                    Étiquette
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" sideOffset={5} align="center" className="w-48">
                  {['Actif', 'En attente', 'Inactif'].map(label => (
                    <DropdownMenuItem
                      key={label}
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => {
                        const currentFilter = table.getColumn('labels')?.getFilterValue() as string[] | undefined || [];
                        const newFilter = currentFilter.includes(label)
                          ? currentFilter.filter(l => l !== label)
                          : [...currentFilter, label];
                        table.getColumn('labels')?.setFilterValue(newFilter.length > 0 ? newFilter : undefined);
                      }}
                    >
                      <Checkbox
                        checked={(table.getColumn('labels')?.getFilterValue() as string[] | undefined || []).includes(label)}
                        className="mr-2"
                      />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {hasLuthaneColumn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex justify-between">
                    Luthane
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" sideOffset={5} align="center" className="w-48">
                  {['Activé', 'Désactivé'].map(status => {
                    const filterValue = status === 'Activé';
                    const currentFilter = table.getColumn('isLuthaneActive')?.getFilterValue();

                    return (
                      <DropdownMenuItem
                        key={status}
                        onSelect={(e) => e.preventDefault()}
                        onClick={() => {
                          if (currentFilter === filterValue) {
                            table.getColumn('isLuthaneActive')?.setFilterValue(undefined);
                          } else {
                            table.getColumn('isLuthaneActive')?.setFilterValue(filterValue);
                          }
                        }}
                      >
                        <Checkbox
                          checked={currentFilter === filterValue}
                          className="mr-2"
                        />
                        {status}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white hover:bg-[#F3F4F6] hover:text-black focus:ring-0 focus:ring-offset-0">
                <Eye className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" alignOffset={-20} className="w-56 custom-select-content-bg">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  if (column.id === "drag" || column.id === "select" || column.id === "actions") {
                    return null;
                  }
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize custom-select-item-bg"
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <Checkbox
                        checked={column.getIsVisible()}
                        className="mr-2"
                        aria-label={`Toggle column ${column.id}`}
                      />
                      {column.columnDef.header as string}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirmDialog(true)} // Ouvre le dialogue de confirmation
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
                      <TableHead key={header.id} colSpan={header.colSpan} className="text-black font-medium whitespace-nowrap">
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
        <DialogContent className="sm:max-w-[425px] w-[350px]">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-sm">
              Êtes-vous sûr de vouloir supprimer {table.getFilteredSelectedRowModel().rows.length} ligne(s) sélectionnée(s) ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-0">
            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirmDialog(false)}>
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
      labels: "Actif",
      progressValue: 75,
      relatedLinks: [
        { label: "Lien Google", href: "https://www.google.com" },
        { label: "Lien Aurentia", href: "https://www.aurentia.fr" },
      ],
    },
    {
      id: "2",
      col1: "Donnée A2",
      col2: "Valeur 2",
      col3: "email2@example.com",
      col4: "9876543210",
      col5: "20",
      labels: "En attente",
      progressValue: 25,
      relatedLinks: [
        { label: "Lien LinkedIn", href: "https://www.linkedin.com" },
      ],
    },
    {
      id: "3",
      col1: "Donnée A3",
      col2: "Valeur 3",
      col3: "email3@example.com",
      col4: "1122334455",
      col5: "30",
      labels: "Inactif",
      progressValue: 90,
      relatedLinks: [],
    },
    {
      id: "4",
      col1: "Donnée A4",
      col2: "Valeur 1",
      col3: "email4@example.com",
      col4: "6677889900",
      col5: "40",
      labels: "Actif",
      progressValue: 50,
      relatedLinks: [
        { label: "Lien Github", href: "https://www.github.com" },
        { label: "Lien StackOverflow", href: "https://stackoverflow.com" },
        { label: "Lien Medium", href: "https://medium.com" },
      ],
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
