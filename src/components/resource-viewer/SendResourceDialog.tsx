import { useState, useEffect, useMemo } from 'react';
import { Send, Search, Users, User, MessageSquare, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { shareResource } from '@/services/resourceShareService';
import { searchUsers, getConversations } from '@/services/messageService';
import { useFindOrCreateDirectConversation } from '@/hooks/messages/useCreateConversation';
import { useCreateGroup } from '@/hooks/messages/useCreateGroup';
import type { OrganizationResource } from '@/services/resourcesService';
import type { PermissionType, ConversationWithDetails } from '@/types/messageTypes';

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 89, 44';
};

interface SendResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: OrganizationResource[];
  onSuccess?: () => void;
}

type RecipientType = 'direct' | 'group' | 'new';

interface UserSearchResult {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

export const SendResourceDialog = ({
  open,
  onOpenChange,
  resources,
  onSuccess,
}: SendResourceDialogProps) => {
  const { userProfile } = useUser();
  const { toast } = useToast();
  const directMutation = useFindOrCreateDirectConversation();
  const groupMutation = useCreateGroup();

  const [recipientType, setRecipientType] = useState<RecipientType>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ConversationWithDetails | null>(null);
  const [selectedNewUsers, setSelectedNewUsers] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [message, setMessage] = useState('');
  const [permissionType, setPermissionType] = useState<PermissionType>('read_only');
  const [sending, setSending] = useState(false);

  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [groups, setGroups] = useState<ConversationWithDetails[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // White-label support
  const whiteLabelEnabled = userProfile?.organization?.settings?.branding?.whiteLabel ?? false;
  const orgPrimaryColor = userProfile?.organization?.settings?.branding?.primaryColor
    || userProfile?.organization?.primary_color
    || '#ff5932';

  const dialogStyles = useMemo(() => {
    if (whiteLabelEnabled && userProfile?.organization) {
      return {
        '--org-primary-color': orgPrimaryColor,
        '--color-primary': orgPrimaryColor,
        '--org-primary-rgb': hexToRgb(orgPrimaryColor),
      } as React.CSSProperties;
    }
    return {};
  }, [whiteLabelEnabled, userProfile?.organization, orgPrimaryColor]);

  // Load groups on mount
  useEffect(() => {
    if (open && userProfile?.id && userProfile?.organization_id) {
      setLoadingGroups(true);
      getConversations(userProfile.id, userProfile.organization_id)
        .then((conversations) => {
          // Filter only group conversations
          setGroups(conversations.filter(c => c.is_group));
        })
        .catch((error) => {
          console.error('Error loading groups:', error);
          toast({
            title: 'Erreur',
            description: 'Impossible de charger les groupes',
            variant: 'destructive',
          });
        })
        .finally(() => setLoadingGroups(false));
    }
  }, [open, userProfile?.id, userProfile?.organization_id, toast]);

  // Search users
  useEffect(() => {
    if (searchQuery.length === 0) {
      setSearchResults([]);
      return;
    }

    const excludeIds = recipientType === 'new'
      ? [userProfile?.id || '', ...selectedNewUsers]
      : [userProfile?.id || ''];

    const fetchUsers = async () => {
      try {
        const results = await searchUsers(searchQuery, excludeIds);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      }
    };

    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, userProfile?.id, selectedNewUsers, recipientType]);

  const getUserName = (user: UserSearchResult) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email;
  };

  const getUserInitials = (user: UserSearchResult) => {
    const name = getUserName(user);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSend = async () => {
    if (!userProfile?.id) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté',
        variant: 'destructive',
      });
      return;
    }

    // Validation
    if (recipientType === 'direct' && !selectedUser) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un destinataire',
        variant: 'destructive',
      });
      return;
    }

    if (recipientType === 'group' && !selectedGroup) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un groupe',
        variant: 'destructive',
      });
      return;
    }

    if (recipientType === 'new' && selectedNewUsers.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner au moins un membre',
        variant: 'destructive',
      });
      return;
    }

    if (recipientType === 'new' && selectedNewUsers.length > 1 && !newGroupName) {
      toast({
        title: 'Erreur',
        description: 'Veuillez donner un nom au groupe',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);

    try {
      let conversationId: string;

      // Get or create conversation based on recipient type
      if (recipientType === 'direct' && selectedUser) {
        // Create or find direct conversation
        const conversation = await directMutation.mutateAsync({
          recipientUserId: selectedUser.id,
        });
        conversationId = conversation.id;
      } else if (recipientType === 'group' && selectedGroup) {
        // Use existing group
        conversationId = selectedGroup.id;
      } else if (recipientType === 'new') {
        // Create new conversation (group or direct)
        if (selectedNewUsers.length === 1) {
          // Direct conversation with single user
          const conversation = await directMutation.mutateAsync({
            recipientUserId: selectedNewUsers[0],
          });
          conversationId = conversation.id;
        } else {
          // Create new group
          const group = await groupMutation.mutateAsync({
            group_name: newGroupName,
            participant_user_ids: selectedNewUsers,
          });
          conversationId = group.id;
        }
      } else {
        throw new Error('Invalid recipient configuration');
      }

      // Send each resource
      let successCount = 0;
      for (const resource of resources) {
        try {
          await shareResource({
            conversation_id: conversationId,
            resource_id: resource.id,
            resource_title: resource.title,
            resource_description: resource.description || '',
            permission_type: permissionType,
            message_content: message || undefined,
          });
          successCount++;
        } catch (error) {
          console.error(`Error sharing resource ${resource.id}:`, error);
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Envoyé !',
          description: resources.length === 1
            ? `"${resources[0].title}" a été envoyée avec succès`
            : `${successCount} ressource(s) envoyée(s) avec succès`,
        });

        onSuccess?.();
        onOpenChange(false);

        // Reset form
        setSelectedUser(null);
        setSelectedGroup(null);
        setSelectedNewUsers([]);
        setNewGroupName('');
        setMessage('');
        setSearchQuery('');
      } else {
        throw new Error('Failed to share any resources');
      }
    } catch (error) {
      console.error('Error sending resources:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer les ressources',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const toggleNewUser = (userId: string) => {
    setSelectedNewUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const removeNewUser = (userId: string) => {
    setSelectedNewUsers(prev => prev.filter(id => id !== userId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" style={dialogStyles}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Envoyer {resources.length > 1 ? `${resources.length} ressources` : 'une ressource'}
          </DialogTitle>
          <DialogDescription>
            Partagez {resources.length > 1 ? 'ces ressources' : 'cette ressource'} avec des membres de votre organisation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resource list (if multiple) */}
          {resources.length > 1 && (
            <div className="border rounded-lg p-3 bg-gray-50 max-h-32 overflow-y-auto">
              <p className="text-sm font-medium mb-2">Ressources sélectionnées :</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {resources.map((resource) => (
                  <li key={resource.id} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                    {resource.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recipient selection */}
          <Tabs value={recipientType} onValueChange={(value) => setRecipientType(value as RecipientType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="direct" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="hidden sm:inline">Direct</span>
              </TabsTrigger>
              <TabsTrigger value="group" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span className="hidden sm:inline">Groupe</span>
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span className="hidden sm:inline">Nouveau</span>
              </TabsTrigger>
            </TabsList>

            {/* Direct Message Tab */}
            <TabsContent value="direct" className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un membre..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {selectedUser ? (
                <div className="border rounded-lg p-3 flex items-center justify-between bg-blue-50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedUser.avatar_url || undefined} />
                      <AvatarFallback>{getUserInitials(selectedUser)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{getUserName(selectedUser)}</p>
                      <p className="text-xs text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center gap-3"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{getUserName(user)}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    ))
                  ) : searchQuery ? (
                    <p className="p-4 text-sm text-gray-500 text-center">Aucun résultat</p>
                  ) : (
                    <p className="p-4 text-sm text-gray-500 text-center">Commencez à taper pour rechercher</p>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Group Tab */}
            <TabsContent value="group" className="space-y-3">
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {loadingGroups ? (
                  <div className="p-8 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : groups.length > 0 ? (
                  groups.map((group) => (
                    <div
                      key={group.id}
                      className={cn(
                        'p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0',
                        selectedGroup?.id === group.id && 'bg-blue-50'
                      )}
                      onClick={() => setSelectedGroup(group)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{group.group_name || 'Groupe sans nom'}</p>
                          <p className="text-xs text-gray-600">
                            {group.participant_count || 0} membre(s)
                          </p>
                        </div>
                        {selectedGroup?.id === group.id && (
                          <Badge variant="default" className="btn-white-label">Sélectionné</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-8 text-sm text-gray-500 text-center">
                    Aucun groupe disponible.<br />
                    Utilisez l'onglet "Nouveau" pour créer une conversation.
                  </p>
                )}
              </div>
            </TabsContent>

            {/* New Conversation Tab */}
            <TabsContent value="new" className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher des membres..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Selected users */}
              {selectedNewUsers.length > 0 && (
                <div className="border rounded-lg p-3 bg-blue-50 space-y-2">
                  <p className="text-sm font-medium">{selectedNewUsers.length} membre(s) sélectionné(s)</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedNewUsers.map((userId) => {
                      const user = searchResults.find(u => u.id === userId);
                      if (!user) return null;
                      return (
                        <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                          {getUserName(user)}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-600"
                            onClick={() => removeNewUser(userId)}
                          />
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Group name if multiple users */}
                  {selectedNewUsers.length > 1 && (
                    <div className="pt-2">
                      <Label htmlFor="group-name" className="text-xs">Nom du groupe</Label>
                      <Input
                        id="group-name"
                        placeholder="Ex: Équipe Marketing"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Search results */}
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div
                      key={user.id}
                      className={cn(
                        'p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center gap-3',
                        selectedNewUsers.includes(user.id) && 'bg-blue-50'
                      )}
                      onClick={() => toggleNewUser(user.id)}
                    >
                      <Checkbox checked={selectedNewUsers.includes(user.id)} />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{getUserName(user)}</p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  ))
                ) : searchQuery ? (
                  <p className="p-4 text-sm text-gray-500 text-center">Aucun résultat</p>
                ) : (
                  <p className="p-4 text-sm text-gray-500 text-center">Commencez à taper pour rechercher</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Permission Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Permissions</Label>
            <RadioGroup value={permissionType} onValueChange={(value) => setPermissionType(value as PermissionType)}>
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="read_only" id="read_only" />
                <Label htmlFor="read_only" className="flex-1 cursor-pointer">
                  <div className="font-medium">Lecture seule</div>
                  <div className="text-xs text-gray-600">Le destinataire peut uniquement consulter</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="read_write" id="read_write" />
                <Label htmlFor="read_write" className="flex-1 cursor-pointer">
                  <div className="font-medium">Lecture et modification</div>
                  <div className="text-xs text-gray-600">Le destinataire peut consulter et modifier</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Optional message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message (optionnel)
            </Label>
            <Textarea
              id="message"
              placeholder="Ajoutez un message personnalisé..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Annuler
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending}
            className="btn-white-label hover:opacity-90 text-white"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
