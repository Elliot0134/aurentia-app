import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ResourceTab, createEmptyTab } from '@/types/resourceTypes';
import * as LucideIcons from 'lucide-react';

interface ResourceTabManagerProps {
  tabs: ResourceTab[];
  activeTabId: string;
  onTabsChange: (tabs: ResourceTab[]) => void;
  onActiveTabChange: (tabId: string) => void;
}

// Icônes courantes pour les tabs
const COMMON_ICONS = [
  { value: 'FileText', label: 'Document' },
  { value: 'BookOpen', label: 'Livre' },
  { value: 'Settings', label: 'Paramètres' },
  { value: 'Lightbulb', label: 'Idée' },
  { value: 'Code', label: 'Code' },
  { value: 'Image', label: 'Image' },
  { value: 'Video', label: 'Vidéo' },
  { value: 'HelpCircle', label: 'Aide' },
  { value: 'Info', label: 'Info' },
  { value: 'CheckCircle', label: 'Succès' },
];

interface SortableTabProps {
  tab: ResourceTab;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  editIcon: string;
  onActivate: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onTitleChange: (title: string) => void;
  onIconChange: (icon: string) => void;
}

function SortableTab({
  tab,
  isActive,
  isEditing,
  editTitle,
  editIcon,
  onActivate,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onTitleChange,
  onIconChange,
}: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Récupérer l'icône dynamiquement
  const IconComponent = tab.icon && (LucideIcons as any)[tab.icon]
    ? (LucideIcons as any)[tab.icon]
    : LucideIcons.FileText;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...(isActive ? {
          backgroundColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 10%, transparent)',
          borderColor: 'var(--color-primary, #ff5932)',
          color: 'var(--color-primary, #ff5932)'
        } : {})
      }}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
        ${isActive
          ? ''
          : 'bg-white border-gray-200 hover:border-gray-300'
        }
        ${isDragging ? 'shadow-lg' : ''}
      `}
    >
      {/* Drag handle */}
      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Icon */}
      {!isEditing && <IconComponent className="w-4 h-4" />}

      {/* Tab content */}
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
          <Input
            value={editTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="h-7 text-sm"
            placeholder="Titre du tab"
            autoFocus
          />
          <Select value={editIcon} onValueChange={onIconChange}>
            <SelectTrigger className="h-7 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMON_ICONS.map((icon) => {
                const Icon = (LucideIcons as any)[icon.value] || LucideIcons.FileText;
                return (
                  <SelectItem key={icon.value} value={icon.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {icon.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onSaveEdit}>
            <Check className="w-4 h-4 text-green-600" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onCancelEdit}>
            <X className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ) : (
        <>
          <button
            onClick={onActivate}
            className="flex-1 text-left font-medium text-sm"
          >
            {tab.title}
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1" data-tour="tab-actions">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit();
              }}
              title="Éditer le tab"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Supprimer le tab"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export function ResourceTabManager({
  tabs,
  activeTabId,
  onTabsChange,
  onActiveTabChange,
}: ResourceTabManagerProps) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editIcon, setEditIcon] = useState('FileText');
  const [deleteConfirmTabId, setDeleteConfirmTabId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddTab = () => {
    const newTab = createEmptyTab(`Tab ${tabs.length + 1}`, tabs.length);
    onTabsChange([...tabs, newTab]);
    onActiveTabChange(newTab.id);
  };

  const handleStartEdit = (tab: ResourceTab) => {
    setEditingTabId(tab.id);
    setEditTitle(tab.title);
    setEditIcon(tab.icon || 'FileText');
  };

  const handleSaveEdit = () => {
    if (editingTabId) {
      const updatedTabs = tabs.map(tab =>
        tab.id === editingTabId
          ? { ...tab, title: editTitle, icon: editIcon }
          : tab
      );
      onTabsChange(updatedTabs);
      setEditingTabId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTabId(null);
    setEditTitle('');
    setEditIcon('FileText');
  };

  const handleDeleteTab = (tabId: string) => {
    if (tabs.length <= 1) {
      // Ne pas supprimer le dernier tab
      return;
    }

    const updatedTabs = tabs.filter(tab => tab.id !== tabId);
    onTabsChange(updatedTabs);

    // Si le tab supprimé était actif, activer le premier tab
    if (activeTabId === tabId) {
      onActiveTabChange(updatedTabs[0]?.id || '');
    }

    setDeleteConfirmTabId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tabs.findIndex(tab => tab.id === active.id);
    const newIndex = tabs.findIndex(tab => tab.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newTabs = [...tabs];
      const [removed] = newTabs.splice(oldIndex, 1);
      newTabs.splice(newIndex, 0, removed);

      // Mettre à jour les ordres
      const reorderedTabs = newTabs.map((tab, index) => ({
        ...tab,
        order: index,
      }));

      onTabsChange(reorderedTabs);
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-center gap-2 overflow-x-auto">
          <SortableContext items={tabs.map(t => t.id)} strategy={horizontalListSortingStrategy}>
            {tabs.map((tab) => (
              <SortableTab
                key={tab.id}
                tab={tab}
                isActive={activeTabId === tab.id}
                isEditing={editingTabId === tab.id}
                editTitle={editTitle}
                editIcon={editIcon}
                onActivate={() => onActiveTabChange(tab.id)}
                onStartEdit={() => handleStartEdit(tab)}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onDelete={() => setDeleteConfirmTabId(tab.id)}
                onTitleChange={setEditTitle}
                onIconChange={setEditIcon}
              />
            ))}
          </SortableContext>

          {/* Add tab button */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 whitespace-nowrap"
            onClick={handleAddTab}
            data-tour="add-tab-button"
          >
            <Plus className="w-4 h-4" />
            Nouveau tab
          </Button>
        </div>
      </DndContext>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmTabId !== null} onOpenChange={() => setDeleteConfirmTabId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce tab ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera le tab et toutes ses sections. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmTabId && handleDeleteTab(deleteConfirmTabId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ResourceTabManager;
