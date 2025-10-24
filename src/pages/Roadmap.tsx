import React, { useState, useEffect } from 'react';
import { Separator } from "@/components/ui/separator";
import ComingSoonDialog from '@/components/ui/ComingSoonDialog';
import UnlockFeaturesPopup from '@/components/ui/UnlockFeaturesPopup';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import * as kanbanService from '@/services/kanbanService';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, MessageCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';

const TAGS = [
  'marketing', 'front-end', 'back-end', 'data', 'sales', 'rh', 'produit', 'design', 'support', 'juridique' // Elliot
];

const columns = [
  { key: "todo", label: "À faire", color: "bg-blue-50 border-blue-200" },
  { key: "inprogress", label: "En cours", color: "bg-yellow-50 border-yellow-200" },
  { key: "done", label: "Fait", color: "bg-green-50 border-green-200" },
];

function KanbanCard({ id, title, description, onClick, isDragging, priority, tags, createdBy, onDelete, commentCount, animationDelay = 0 }: {
  id: string;
  title: string;
  description: string;
  onClick?: () => void;
  isDragging?: boolean;
  priority: 'faible'|'moyenne'|'haute';
  tags: string[];
  createdBy: string;
  onDelete?: () => void;
  commentCount?: number;
  animationDelay?: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: dndDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'all 180ms cubic-bezier(0.4,0,0.2,1)',
    zIndex: dndDragging ? 50 : 1,
    opacity: dndDragging || isDragging ? 0.3 : 1,
    pointerEvents: isDragging ? ('none' as React.CSSProperties['pointerEvents']) : 'auto' as React.CSSProperties['pointerEvents'],
    animationDelay: `${animationDelay}s`,
  };
  const priorityColor =
    priority === 'haute' ? 'bg-red-100 text-red-700 border-red-300' :
    priority === 'moyenne' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
    'bg-green-100 text-green-700 border-green-300';
  const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={
        `relative bg-white rounded-2xl shadow-lg p-4 mb-4 border border-gray-200 hover:shadow-2xl hover:border-primary/60 hover:scale-[1.03] transition-all duration-200 ease-in-out cursor-pointer select-none group animate-fadein`
        + (dndDragging ? ' ring-2 ring-primary' : '')
      }
    >
      {/* Avatar + priorité */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold text-sm">
          {createdBy?.[0]?.toUpperCase() || '?'}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${priorityColor}`}>{priorityLabel}</span>
        <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDelete && (
            <button
              className="p-1 rounded hover:bg-red-100 text-red-500"
              onClick={e => { e.stopPropagation(); onDelete(); }}
              title="Supprimer la carte"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      <h3 className="font-semibold text-lg mb-1 text-gray-800 group-hover:text-primary transition-colors duration-200 ease-in-out line-clamp-2">{title}</h3>
      <p className="text-gray-600 text-sm group-hover:text-gray-800 transition-colors duration-200 ease-in-out line-clamp-3 mb-2">{description}</p>
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">{tag}</span>
        ))}
      </div>
      {/* Comment count */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
        <MessageCircle size={14} />
        <span>{commentCount ?? 0}</span>
      </div>
    </div>
  );
}

function KanbanCardPlaceholder({ height = 80 }: { height?: number }) {
  // Un placeholder invisible pour garder la place de la card pendant le drag
  return (
    <div style={{ height, marginBottom: 16, borderRadius: 16, opacity: 0, pointerEvents: 'none' }} />
  );
}

function KanbanColumn({
  label,
  color,
  columnKey,
  tasks,
  activeId,
  onCardClick,
  isOver,
  onAddCard,
  onDelete,
  commentCountByCard,
}: {
  label: string;
  color: string;
  columnKey: string;
  tasks: kanbanService.KanbanCard[];
  activeId?: string | null;
  onCardClick?: (id: string) => void;
  isOver?: boolean;
  onAddCard?: (title: string, desc: string) => void;
  onDelete?: (id: string) => void;
  commentCountByCard: Record<string, number>;
}) {
  const { setNodeRef } = useDroppable({ id: columnKey });
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  return (
    <div
      ref={setNodeRef}
      className={`w-[280px] ${color} rounded-2xl p-4 mx-2 border-2 flex flex-col shadow-md transition-all duration-200 ease-in-out ${isOver ? 'ring-4 ring-primary/30 shadow-xl' : ''}`}
    >
      <h2 className="text-xl font-bold mb-3 text-center text-gray-700 tracking-tight sticky top-0 bg-opacity-80 z-10">{label}</h2>
      <Separator className="mb-3" />
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.length === 0 ? (
          <div className="text-gray-400 italic text-center animate-fadein">Aucune tâche</div>
        ) : (
          tasks.map((task, index) =>
            activeId === task.id ? (
              <KanbanCardPlaceholder key={task.id} height={88} />
            ) : (
              <KanbanCard
                key={task.id}
                id={task.id}
                title={task.name}
                description={task.description}
                priority={task.priority}
                tags={task.tags}
                createdBy={task.created_by}
                commentCount={commentCountByCard[task.id] || 0}
                onClick={() => onCardClick && onCardClick(task.id)}
                onDelete={onDelete ? () => onDelete(task.id) : undefined}
                animationDelay={index * 0.1}
              />
            )
          )
        )}
      </SortableContext>
      {/* Ajout de carte */}
      {adding ? (
        <div className="bg-white rounded-xl shadow p-3 mt-2 flex flex-col gap-2 border border-gray-200 animate-fadein">
          <input
            className="border rounded px-2 py-1 text-sm focus:outline-primary"
            placeholder="Nom de la tâche"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            autoFocus
          />
          <textarea
            className="border rounded px-2 py-1 text-sm focus:outline-primary min-h-[40px]"
            placeholder="Description"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors duration-150" onClick={() => setAdding(false)}>Annuler</button>
            <button
              className="text-xs px-2 py-1 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors duration-150"
              disabled={!newTitle.trim()}
              onClick={() => {
                if (onAddCard && newTitle.trim()) {
                  onAddCard(newTitle, newDesc);
                  setNewTitle('');
                  setNewDesc('');
                  setAdding(false);
                }
              }}
            >Ajouter</button>
          </div>
        </div>
      ) : (
        <button
          className="mt-2 text-primary text-xs font-medium hover:underline hover:text-primary/80 transition self-center"
          onClick={() => setAdding(true)}
        >+ Ajouter une carte</button>
      )}
    </div>
  );
}

const Roadmap = () => {
  const { id: routeProjectId } = useParams<{ id: string }>();
  const { currentProjectId } = useProject();
  const projectId = currentProjectId || routeProjectId;
  const [userId, setUserId] = useState<string | null>(null);
  const [cards, setCards] = useState<kanbanService.KanbanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<kanbanService.KanbanComment[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editCardId, setEditCardId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<'faible'|'moyenne'|'haute'>('moyenne');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<'todo'|'inprogress'|'done'>('todo');
  const [commentInput, setCommentInput] = useState('');
  const [overCol, setOverCol] = useState<string | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Charger les cards au chargement
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    kanbanService.getCards(projectId)
      .then(setCards)
      .finally(() => setLoading(false));
  }, [projectId]);

  // Charger les commentaires quand une card est éditée
  useEffect(() => {
    if (!editCardId) return;
    setLoadingComments(true);
    kanbanService.getComments(editCardId)
      .then(setComments)
      .finally(() => setLoadingComments(false));
  }, [editCardId]);

  // Regroupe les tâches par colonne
  const tasksByColumn = columns.reduce((acc, col) => {
    acc[col.key] = cards.filter((t) => t.status === col.key);
    return acc;
  }, {} as Record<string, kanbanService.KanbanCard[]>);

  // Gestion du drag & drop
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };
  const handleDragOver = (event: any) => {
    const { over } = event;
    if (!over) return setOverCol(null);
    // Si on survole une colonne vide, over.id === col.key
    for (const col of columns) {
      if (over.id === col.key) {
        setOverCol(col.key);
        return;
      }
      if (tasksByColumn[col.key].find((t) => t.id === over.id)) {
        setOverCol(col.key);
        return;
      }
    }
    setOverCol(null);
  };
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverCol(null);
    if (!over) return;
    if (active.id === over.id) return;
    let destCol = '';
    for (const col of columns) {
      if (over.id === col.key || tasksByColumn[col.key].find((t) => t.id === over.id)) destCol = col.key;
    }
    if (!destCol) return;
    // Update en base
    const card = cards.find(c => c.id === active.id);
    if (card && card.status !== destCol) {
      await kanbanService.updateCard({ id: card.id, status: destCol as 'todo'|'inprogress'|'done' });
      const updated = await kanbanService.getCards(projectId);
      setCards(updated);
    }
  };
  const handleDragCancel = () => {
    setActiveId(null);
    setOverCol(null);
  };

  // Edition
  const handleCardClick = (id: string) => {
    const card = cards.find((t) => t.id === id);
    if (!card) return;
    setEditCardId(id);
    setEditName(card.name);
    setEditDesc(card.description);
    setEditPriority(card.priority);
    setEditTags(card.tags);
    setEditStatus(card.status as 'todo'|'inprogress'|'done');
  };
  const handleEditSave = async () => {
    if (!editCardId) return;
    await kanbanService.updateCard({
      id: editCardId,
      name: editName,
      description: editDesc,
      priority: editPriority,
      tags: editTags,
      status: editStatus,
    });
    setEditCardId(null);
    setCards(await kanbanService.getCards(projectId));
  };
  const handleEditDelete = async () => {
    if (!editCardId) return;
    await kanbanService.deleteCard(editCardId);
    setEditCardId(null);
    setCards(await kanbanService.getCards(projectId));
  };
  // Ajout de carte
  const handleAddCard = async (colKey: string, name: string, desc: string) => {
    if (!userId || !projectId) return;
    await kanbanService.addCard({
      name,
      description: desc,
      priority: 'moyenne',
      tags: [],
      status: colKey as 'todo'|'inprogress'|'done',
      created_by: userId,
      project_id: projectId,
    });
    setCards(await kanbanService.getCards(projectId));
  };
  // Commentaires
  const handleAddComment = async () => {
    if (!editCardId || !userId || !commentInput.trim()) return;
    await kanbanService.addComment({
      card_id: editCardId,
      author: userId,
      comment: commentInput.trim(),
    });
    setCommentInput('');
    setComments(await kanbanService.getComments(editCardId));
  };
  const handleDeleteComment = async (commentId: string) => {
    if (!editCardId) return;
    await kanbanService.deleteComment(commentId);
    setComments(await kanbanService.getComments(editCardId));
  };

  // Card à afficher dans l'overlay
  const activeCard = activeId ? cards.find((t) => t.id === activeId) : null;

  const handleDeleteCard = async (id: string) => {
    await kanbanService.deleteCard(id);
    setCards(await kanbanService.getCards(projectId));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!comments.length) return;
    const uniqueIds = Array.from(new Set(comments.map(c => c.author)));
    const missingIds = uniqueIds.filter(id => typeof id === 'string' && id.length === 36 && !(id in commentAuthors));
    if (missingIds.length === 0) return;
    // DEBUG: log les ids recherchés
    // console.log('Fetching display names for ids:', missingIds);
    (async () => {
      const ids = missingIds;
      if (!Array.isArray(ids) || ids.length === 0) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', ids);
      if (!error && data) {
        const mapping: Record<string, string> = {};
        for (const user of data) {
          mapping[user.id] = user.display_name?.trim() || user.email || user.id.slice(0, 4) + '…';
        }
        setCommentAuthors(prev => ({ ...prev, ...mapping }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  const commentCountByCard: Record<string, number> = {};
  comments.forEach(c => {
    commentCountByCard[c.card_id] = (commentCountByCard[c.card_id] || 0) + 1;
  });

  const [isUnlockPopupOpen, setIsUnlockPopupOpen] = useState(false);
  const { subscriptionStatus } = useSubscriptionStatus();
  const { userProjects } = useProject();
  const [projectTitle, setProjectTitle] = useState<string>("Votre projet");

  useEffect(() => {
    // Vérifier le statut de l'utilisateur et ouvrir le bon popup
    if (subscriptionStatus === "inactive") {
      setIsUnlockPopupOpen(true);
    }
    // Ne plus afficher automatiquement le popup "fonctionnalité à venir"
  }, [subscriptionStatus]);

  useEffect(() => {
    // Récupérer le titre du projet
    if (projectId) {
      const project = userProjects.find(p => p.project_id === projectId);
      if (project) {
        setProjectTitle(project.nom_projet);
      }
    }
  }, [projectId, userProjects]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left tracking-tight">Plan d'action</h1>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex flex-col md:flex-row gap-6 md:gap-0 justify-between items-start w-full overflow-x-auto pb-4 mt-4">
          {columns.map((col) => (
            <SortableContext
              key={col.key}
              items={tasksByColumn[col.key].length ? tasksByColumn[col.key].map((t) => t.id) : [col.key]}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                label={col.label}
                color={col.color}
                columnKey={col.key}
                tasks={tasksByColumn[col.key]}
                activeId={activeId}
                onCardClick={handleCardClick}
                isOver={overCol === col.key}
                onAddCard={(title, desc) => handleAddCard(col.key, title, desc)}
                onDelete={handleDeleteCard}
                commentCountByCard={commentCountByCard}
              />
            </SortableContext>
          ))}
        </div>
        <DragOverlay>
          {activeCard ? (
            <KanbanCard
              id={activeCard.id}
              title={activeCard.name}
              description={activeCard.description}
              priority={activeCard.priority}
              tags={activeCard.tags}
              createdBy={activeCard.created_by}
              commentCount={commentCountByCard[activeCard.id] || 0}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      <div className="mt-8 text-center text-gray-400 text-xs">Glissez-déposez les cartes pour les déplacer entre les colonnes.<br/>Cliquez sur une carte pour l'éditer.</div>

      {/* Modale d'édition */}
      <Dialog open={!!editCardId} onOpenChange={(open) => !open && setEditCardId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Éditer la carte</DialogTitle>
            <DialogDescription>Modifiez le nom, la description, la priorité, les tags et le statut de la tâche.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Nom de la tâche"
              className="text-lg font-semibold"
            />
            <Textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              placeholder="Description"
              className="min-h-[80px]"
            />
            {/* Sélecteur de priorité */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Priorité :</label>
              <select
                className="border rounded px-2 py-1 text-sm focus:outline-primary"
                value={editPriority}
                onChange={e => setEditPriority(e.target.value as 'faible'|'moyenne'|'haute')}
              >
                <option value="faible">Faible</option>
                <option value="moyenne">Moyenne</option>
                <option value="haute">Haute</option>
              </select>
            </div>
            {/* Sélecteur de statut - visible uniquement sur mobile */}
            <div className="flex items-center gap-2 md:hidden">
              <label className="text-sm font-medium">Statut :</label>
              <select
                className="border rounded px-2 py-1 text-sm focus:outline-primary"
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as 'todo'|'inprogress'|'done')}
              >
                <option value="todo">À faire</option>
                <option value="inprogress">En cours</option>
                <option value="done">Fait</option>
              </select>
            </div>
            {/* Commentaires */}
            <div>
              <div className="font-semibold text-sm mb-1">Commentaires</div>
              <div className="max-h-40 overflow-y-auto space-y-2 mb-2">
                {loadingComments ? (
                  <div className="text-xs text-gray-400">Chargement...</div>
                ) : comments.length === 0 ? (
                  <div className="text-xs text-gray-400 italic">Aucun commentaire</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2 bg-gray-50 rounded p-2">
                      <div className="font-bold text-primary text-xs mt-0.5">{c.author === userId ? 'Moi' : (commentAuthors[c.author] || c.author.slice(0, 4) + '…')}</div>
                      <div className="flex-1 text-xs text-gray-700">{c.comment}</div>
                      <button
                        className="text-xs text-red-400 hover:text-red-600 ml-2"
                        onClick={() => handleDeleteComment(c.id)}
                        title="Supprimer le commentaire"
                      >✕</button>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 mt-1">
                <input
                  className="border rounded px-2 py-1 text-xs flex-1 focus:outline-primary"
                  placeholder="Ajouter un commentaire..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
                  disabled={loadingComments}
                />
                <Button size="sm" onClick={handleAddComment} disabled={!commentInput.trim() || loadingComments}>Envoyer</Button>
              </div>
            </div>
            <div className="flex justify-between gap-2 pt-2">
              <Button variant="destructive" onClick={handleEditDelete}>Supprimer</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditCardId(null)}>Annuler</Button>
                <Button onClick={handleEditSave} disabled={!editName.trim()}>Enregistrer</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UnlockFeaturesPopup
        isOpen={isUnlockPopupOpen}
        onClose={() => setIsUnlockPopupOpen(false)}
        projectTitle={projectTitle}
        projectId={projectId}
      />
    </div>
  );
};

export default Roadmap;
