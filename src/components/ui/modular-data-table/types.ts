import { UniqueIdentifier } from "@dnd-kit/core";
import { ColumnDef } from "@tanstack/react-table";
import { LucideIcon } from "lucide-react";

/**
 * Interface de base pour les données de ligne du tableau
 */
export interface BaseRowData {
  id: UniqueIdentifier;
  [key: string]: any;
}

/**
 * Configuration d'une colonne personnalisée
 */
export interface ColumnConfig<TData extends BaseRowData> {
  accessorKey: string;
  header: string;
  cell?: (data: TData) => React.ReactNode;
  size?: number;
  minSize?: number;
  enableSorting?: boolean;
  enableHiding?: boolean;
  filterFn?: (row: any, id: string, value: any) => boolean;
}

/**
 * Configuration d'un filtre
 */
export interface FilterConfig {
  id: string;
  label: string;
  type: 'checkbox' | 'select' | 'date' | 'custom';
  options?: Array<{
    label: string;
    value: any;
    icon?: LucideIcon;
  }>;
  filterFn?: (row: any, id: string, value: any) => boolean;
  render?: (currentValue: any, onChange: (value: any) => void) => React.ReactNode;
}

/**
 * Configuration d'une action de ligne
 */
export interface RowAction<TData extends BaseRowData> {
  label: string;
  icon?: LucideIcon;
  onClick: (data: TData) => void;
  variant?: 'default' | 'destructive';
  show?: (data: TData) => boolean;
}

/**
 * Configuration d'une action groupée
 */
export interface BulkAction<TData extends BaseRowData> {
  label: string;
  icon?: LucideIcon;
  onClick: (selectedRows: TData[]) => void;
  variant?: 'default' | 'destructive';
  confirmMessage?: string;
}

/**
 * Configuration des onglets du modal
 */
export interface ModalTabConfig<TData extends BaseRowData> {
  id: string;
  label: string;
  render: (data: TData) => React.ReactNode;
}

/**
 * Configuration complète du tableau modulaire
 */
export interface ModularTableConfig<TData extends BaseRowData> {
  // Colonnes
  columns: ColumnConfig<TData>[];
  
  // Recherche
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[]; // Clés à rechercher
  
  // Filtres
  filters?: FilterConfig[];
  
  // Actions
  rowActions?: RowAction<TData>[];
  bulkActions?: BulkAction<TData>[];
  
  // Drag & Drop
  draggable?: boolean;
  onReorder?: (newData: TData[]) => void;
  
  // Sélection
  selectable?: boolean;
  
  // Pagination
  pageSizes?: number[];
  defaultPageSize?: number;
  
  // Modal
  modalEnabled?: boolean;
  modalTabs?: ModalTabConfig<TData>[];
  modalTitle?: (data: TData) => string;
  modalSubtitle?: (data: TData) => string;
  modalAvatar?: (data: TData) => { text: string; bgColor?: string };
  
  // Personnalisation
  title?: string;
  emptyMessage?: string;
  
  // Colonnes spéciales
  hasProgressColumn?: boolean;
  hasLinksColumn?: boolean;
  hasSwitchColumn?: {
    header: string;
    accessorKey: string;
    onChange: (data: TData, value: boolean) => void;
  };
  hasLabelsColumn?: {
    accessorKey: string;
    labelConfig: Record<string, {
      icon?: LucideIcon;
      iconBgColor: string;
      iconColor: string;
    }>;
  };
  hasUrlColumn?: {
    accessorKey: string;
    icon?: LucideIcon;
  };
  hasDateColumn?: {
    accessorKey: string;
    icon?: LucideIcon;
    onChange?: (data: TData, newDate: Date | undefined) => void;
  };
  hasEditableLabelsColumn?: {
    accessorKey: string;
    options: string[];
    labelConfig: Record<string, {
      icon?: LucideIcon;
      iconBgColor: string;
      iconColor: string;
    }>;
    onChange?: (data: TData, newLabel: string) => void;
  };
  hasRatingColumn?: {
    accessorKey: string;
    maxRating?: number;
    onChange?: (data: TData, newRating: number) => void;
  };
  hasMultiSelectLabelsColumn?: {
    accessorKey: string;
    options: string[];
    getTagColor: (option: string) => string;
    onChange?: (data: TData, selectedOptions: string[]) => void;
  };
  hasCurrencyColumn?: {
    accessorKey: string;
    currency?: string;
    locale?: string;
  };
  hasLocationColumn?: {
    accessorKey: string;
    icon?: LucideIcon;
  };
  
  // Action Button column
  hasActionButtonColumn?: {
    accessorKey: string;
    buttonLabel?: string;
    icon?: LucideIcon;
    onClick: (data: TData) => void;
  };
  
  // Sticky columns
  stickyFirstColumn?: boolean;
}
