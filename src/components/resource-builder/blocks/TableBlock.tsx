import React, { useState } from 'react';
import { Plus, X, Table as TableIcon, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { TableBlock as TableBlockType } from '@/types/resourceTypes';

interface TableBlockProps {
  block: TableBlockType;
  isActive: boolean;
  onUpdate: (data: Partial<TableBlockType['data']>) => void;
  onActivate: () => void;
  readOnly?: boolean;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  isActive,
  onUpdate,
  onActivate,
  readOnly = false
}) => {
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const { headers = [], rows = [], hasHeader = true } = block.data;

  // Add column
  const handleAddColumn = () => {
    const newHeaders = [...headers, `Colonne ${headers.length + 1}`];
    const newRows = rows.map(row => [...row, '']);
    onUpdate({ headers: newHeaders, rows: newRows });
  };

  // Delete column
  const handleDeleteColumn = (colIndex: number) => {
    if (headers.length <= 1) return; // Keep at least 1 column
    const newHeaders = headers.filter((_, i) => i !== colIndex);
    const newRows = rows.map(row => row.filter((_, i) => i !== colIndex));
    onUpdate({ headers: newHeaders, rows: newRows });
  };

  // Add row
  const handleAddRow = () => {
    const newRow = headers.map(() => '');
    onUpdate({ rows: [...rows, newRow] });
  };

  // Delete row
  const handleDeleteRow = (rowIndex: number) => {
    if (rows.length <= 1) return; // Keep at least 1 row
    const newRows = rows.filter((_, i) => i !== rowIndex);
    onUpdate({ rows: newRows });
  };

  // Update header
  const handleUpdateHeader = (colIndex: number, value: string) => {
    const newHeaders = headers.map((h, i) => i === colIndex ? value : h);
    onUpdate({ headers: newHeaders });
  };

  // Update cell
  const handleUpdateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = rows.map((row, rIdx) =>
      rIdx === rowIndex
        ? row.map((cell, cIdx) => cIdx === colIndex ? value : cell)
        : row
    );
    onUpdate({ rows: newRows });
  };

  // Toggle header
  const handleToggleHeader = (checked: boolean) => {
    onUpdate({ hasHeader: checked });
  };

  // READONLY MODE
  if (readOnly) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 bg-white">
          {hasHeader && headers.length > 0 && (
            <thead>
              <tr className="bg-gray-100">
                {headers.map((header, colIdx) => (
                  <th
                    key={colIdx}
                    className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50">
                {row.map((cell, colIdx) => (
                  <td
                    key={colIdx}
                    className="border border-gray-300 px-4 py-2 text-gray-700"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // EDIT MODE
  return (
    <div
      className={cn(
        "relative border-2 rounded-lg p-4 transition-all",
        isActive ? "" : "border-transparent hover:border-gray-200"
      )}
      style={isActive ? {
        borderColor: 'var(--color-primary, #ff5932)',
        backgroundColor: 'rgba(59, 130, 246, 0.05)'
      } : undefined}
      onClick={onActivate}
    >
      {/* Block Type Indicator */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium">Tableau</span>
        </div>

        {isActive && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="header-toggle"
                checked={hasHeader}
                onCheckedChange={handleToggleHeader}
              />
              <Label htmlFor="header-toggle" className="text-xs text-gray-600 cursor-pointer">
                En-tête
              </Label>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="border-collapse border-2 border-gray-300 bg-white">
            {/* Headers */}
            {hasHeader && (
              <thead>
                <tr className="bg-gray-100">
                  {headers.map((header, colIdx) => (
                    <th
                      key={colIdx}
                      className={cn(
                        "relative border border-gray-300 p-0 group",
                        hoveredCol === colIdx && "bg-blue-50"
                      )}
                      onMouseEnter={() => setHoveredCol(colIdx)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      {/* Delete Column Button */}
                      {isActive && headers.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteColumn(colIdx);
                          }}
                          className="absolute -top-6 left-1/2 -translate-x-1/2 p-1 bg-white border rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
                          title="Supprimer colonne"
                        >
                          <X className="w-3 h-3 text-red-600" />
                        </button>
                      )}

                      {/* Header Input */}
                      {editingCell?.row === -1 && editingCell?.col === colIdx ? (
                        <Input
                          value={header}
                          onChange={(e) => handleUpdateHeader(colIdx, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingCell(null);
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          className="border-0 h-auto min-h-[2.5rem] px-3 py-2 font-semibold bg-transparent focus-visible:ring-1 focus-visible:ring-blue-400"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div
                          className="min-h-[2.5rem] px-3 py-2 cursor-text font-semibold text-gray-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({ row: -1, col: colIdx });
                          }}
                        >
                          {header || <span className="text-gray-400">En-tête</span>}
                        </div>
                      )}

                      {/* Add Column Button (right edge) */}
                      {isActive && colIdx === headers.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddColumn();
                          }}
                          className="absolute -right-3 top-1/2 -translate-y-1/2 p-1 bg-white border rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 z-10"
                          title="Ajouter colonne"
                        >
                          <Plus className="w-3 h-3 text-blue-600" />
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
            )}

            {/* Rows */}
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={cn(
                    "group relative",
                    hoveredRow === rowIdx && "bg-blue-50/50"
                  )}
                  onMouseEnter={() => setHoveredRow(rowIdx)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {row.map((cell, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn(
                        "border border-gray-300 p-0 relative",
                        hoveredCol === colIdx && "bg-blue-50/50"
                      )}
                      onMouseEnter={() => setHoveredCol(colIdx)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      {/* Cell Input */}
                      {editingCell?.row === rowIdx && editingCell?.col === colIdx ? (
                        <Input
                          value={cell}
                          onChange={(e) => handleUpdateCell(rowIdx, colIdx, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingCell(null);
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          className="border-0 h-auto min-h-[2.5rem] px-3 py-2 bg-transparent focus-visible:ring-1 focus-visible:ring-blue-400"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div
                          className="min-h-[2.5rem] px-3 py-2 cursor-text text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({ row: rowIdx, col: colIdx });
                          }}
                        >
                          {cell || <span className="text-gray-300">Vide</span>}
                        </div>
                      )}
                    </td>
                  ))}

                  {/* Delete Row Button */}
                  {isActive && rows.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRow(rowIdx);
                      }}
                      className="absolute -left-7 top-1/2 -translate-y-1/2 p-1 bg-white border rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
                      title="Supprimer ligne"
                    >
                      <X className="w-3 h-3 text-red-600" />
                    </button>
                  )}

                  {/* Add Row Button (bottom edge of last row) */}
                  {isActive && rowIdx === rows.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddRow();
                      }}
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 p-1 bg-white border rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 z-10"
                      title="Ajouter ligne"
                    >
                      <Plus className="w-3 h-3 text-blue-600" />
                    </button>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Quick Add Buttons */}
          {isActive && (
            <div className="flex gap-2 mt-3">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddRow();
                }}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Ligne
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddColumn();
                }}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Colonne
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Help text */}
      {isActive && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
          💡 Cliquez sur une cellule pour éditer • Passez la souris sur les bords pour ajouter des lignes/colonnes • Boutons '-' pour supprimer
        </div>
      )}
    </div>
  );
};

export default TableBlock;
