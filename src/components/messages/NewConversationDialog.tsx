import { useState, useEffect, useMemo } from "react";
import { MessageSquare, Users, X, Loader2, Mail, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useFindOrCreateDirectConversation, useCreateConversation } from "@/hooks/messages/useCreateConversation";
import { useCreateGroup } from "@/hooks/messages/useCreateGroup";
import { validateUserByEmail } from "@/services/messageService";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 89, 44';
};

// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated?: (conversationId: string) => void;
  organizationId?: string;
}

type ConversationType = "direct" | "group";

export const NewConversationDialog = ({
  open,
  onOpenChange,
  onConversationCreated,
  organizationId,
}: NewConversationDialogProps) => {
  const { userProfile } = useUser();
  const [conversationType, setConversationType] = useState<ConversationType>("direct");
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const directMutation = useFindOrCreateDirectConversation();
  const createConversationMutation = useCreateConversation();
  const groupMutation = useCreateGroup();

  // White-label support
  const whiteLabelEnabled = userProfile?.organization?.settings?.branding?.whiteLabel ?? false;
  const orgPrimaryColor = userProfile?.organization?.settings?.branding?.primaryColor
    || userProfile?.organization?.primary_color
    || '#ff5932';
  const orgSecondaryColor = userProfile?.organization?.settings?.branding?.secondaryColor
    || userProfile?.organization?.secondary_color
    || '#1a1a1a';

  const dialogStyles = useMemo(() => {
    // Only apply white-label colors when in organization messaging context
    if (organizationId && whiteLabelEnabled && userProfile?.organization) {
      return {
        '--org-primary-color': orgPrimaryColor,
        '--org-secondary-color': orgSecondaryColor,
        '--org-primary-rgb': hexToRgb(orgPrimaryColor),
        '--org-secondary-rgb': hexToRgb(orgSecondaryColor),
        '--color-primary': orgPrimaryColor,
      } as React.CSSProperties;
    }
    return {};
  }, [organizationId, whiteLabelEnabled, userProfile?.organization, orgPrimaryColor, orgSecondaryColor]);

  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim().toLowerCase();

    if (!trimmedEmail) return;

    if (!isValidEmail(trimmedEmail)) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive",
      });
      return;
    }

    if (trimmedEmail === userProfile?.email?.toLowerCase()) {
      toast({
        title: "Action impossible",
        description: "Vous ne pouvez pas démarrer une conversation avec vous-même",
        variant: "destructive",
      });
      return;
    }

    if (conversationType === "direct") {
      // For direct messages, replace the single email
      setEmails([trimmedEmail]);
    } else {
      // For groups, add to the list if not already present
      if (!emails.includes(trimmedEmail)) {
        setEmails([...emails, trimmedEmail]);
      }
    }

    setEmailInput("");
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter(e => e !== emailToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);

    try {
      // For direct messages, use email from input if not in emails array yet
      const directEmail = conversationType === "direct"
        ? (emails.length === 1 ? emails[0] : emailInput.trim().toLowerCase())
        : null;

      if (conversationType === "direct" && directEmail) {
        // Validate email format
        if (!isValidEmail(directEmail)) {
          toast({
            title: "Email invalide",
            description: "Veuillez entrer une adresse email valide",
            variant: "destructive",
          });
          setIsCreating(false);
          return;
        }

        // Check not sending to self
        if (directEmail === userProfile?.email?.toLowerCase()) {
          toast({
            title: "Action impossible",
            description: "Vous ne pouvez pas démarrer une conversation avec vous-même",
            variant: "destructive",
          });
          setIsCreating(false);
          return;
        }

        // Look up user by email
        const user = await validateUserByEmail(directEmail);

        if (!user) {
          toast({
            title: "Utilisateur introuvable",
            description: "Aucun utilisateur trouvé avec cette adresse email",
            variant: "destructive",
          });
          setIsCreating(false);
          return;
        }

        // Check for existing direct conversation with this user
        const { data: existingConversation } = await supabase
          .from("conversation_participants")
          .select("conversation_id, conversations!inner(*)")
          .eq("user_id", userProfile!.id)
          .is("left_at", null);

        if (existingConversation) {
          for (const participation of existingConversation) {
            const conv = (participation as any).conversations;

            // Skip if wrong type or group
            if (conv.is_group) continue;
            if (organizationId && conv.organization_id !== organizationId) continue;
            if (!organizationId && conv.organization_id) continue;

            // Check if other participant is the target user
            const { data: participants } = await supabase
              .from("conversation_participants")
              .select("user_id")
              .eq("conversation_id", participation.conversation_id)
              .is("left_at", null);

            if (
              participants &&
              participants.length === 2 &&
              participants.some((p) => p.user_id === user.id)
            ) {
              // Found existing conversation!
              toast({
                title: "Conversation existante",
                description: "Une conversation existe déjà avec cet utilisateur",
              });
              onConversationCreated?.(participation.conversation_id);
              handleClose();
              setIsCreating(false);
              return;
            }
          }
        }

        let conversation;
        if (organizationId) {
          // Create organization-scoped direct conversation
          conversation = await createConversationMutation.mutateAsync({
            type: "organization",
            is_group: false,
            organization_id: organizationId,
            participant_user_ids: [user.id],
          });
        } else {
          // Create personal direct conversation
          conversation = await directMutation.mutateAsync(user.id);
        }

        onConversationCreated?.(conversation.id);
        handleClose();
      } else if (conversationType === "group" && emails.length >= 1) {
        // Look up all users by email
        const userPromises = emails.map(email => validateUserByEmail(email));
        const users = await Promise.all(userPromises);

        const validUsers = users.filter((u): u is NonNullable<typeof u> => u !== null);

        if (validUsers.length === 0) {
          toast({
            title: "Aucun utilisateur trouvé",
            description: "Aucun des emails saisis ne correspond à un utilisateur",
            variant: "destructive",
          });
          setIsCreating(false);
          return;
        }

        if (validUsers.length < users.length) {
          toast({
            title: "Certains emails invalides",
            description: `${users.length - validUsers.length} email(s) ne correspondent à aucun utilisateur`,
            variant: "destructive",
          });
        }

        // If only 1 user, create a direct message instead of a group
        if (validUsers.length === 1) {
          const user = validUsers[0];

          // Check for existing direct conversation with this user
          const { data: existingConversation } = await supabase
            .from("conversation_participants")
            .select("conversation_id, conversations!inner(*)")
            .eq("user_id", userProfile!.id)
            .is("left_at", null);

          if (existingConversation) {
            for (const participation of existingConversation) {
              const conv = (participation as any).conversations;

              // Skip if wrong type or group
              if (conv.is_group) continue;
              if (organizationId && conv.organization_id !== organizationId) continue;
              if (!organizationId && conv.organization_id) continue;

              // Check if other participant is the target user
              const { data: participants } = await supabase
                .from("conversation_participants")
                .select("user_id")
                .eq("conversation_id", participation.conversation_id)
                .is("left_at", null);

              if (
                participants &&
                participants.length === 2 &&
                participants.some((p) => p.user_id === user.id)
              ) {
                // Found existing conversation!
                toast({
                  title: "Message direct créé",
                  description: "Une seule personne ajoutée, création d'un message direct",
                });
                onConversationCreated?.(participation.conversation_id);
                handleClose();
                setIsCreating(false);
                return;
              }
            }
          }

          // Create new direct conversation
          let conversation;
          if (organizationId) {
            conversation = await createConversationMutation.mutateAsync({
              type: "organization",
              is_group: false,
              organization_id: organizationId,
              participant_user_ids: [user.id],
            });
          } else {
            conversation = await directMutation.mutateAsync(user.id);
          }

          toast({
            title: "Message direct créé",
            description: "Une seule personne ajoutée, création d'un message direct",
          });
          onConversationCreated?.(conversation.id);
          handleClose();
        } else {
          // Create group with 2+ users
          if (!groupName.trim()) {
            toast({
              title: "Nom de groupe requis",
              description: "Veuillez entrer un nom pour le groupe",
              variant: "destructive",
            });
            setIsCreating(false);
            return;
          }

          const conversation = await groupMutation.mutateAsync({
            group_name: groupName.trim(),
            group_description: groupDescription.trim() || undefined,
            participant_user_ids: validUsers.map(u => u.id),
            organization_id: organizationId,
          });

          onConversationCreated?.(conversation.id);
          handleClose();
        }
      }
    } catch (error) {
      console.error("Error creating conversation:", error);

      // Show user-friendly error message
      toast({
        title: "Échec de la création",
        description: error instanceof Error
          ? "Une erreur est survenue lors de la création de la conversation. Veuillez réessayer."
          : "Une erreur inattendue est survenue",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setConversationType("direct");
    setEmailInput("");
    setEmails([]);
    setGroupName("");
    setGroupDescription("");
    setIsCreating(false);
    onOpenChange(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [open]);

  const canCreate = conversationType === "direct"
    ? (emails.length === 1 || (emailInput.trim() && isValidEmail(emailInput.trim().toLowerCase())))
    : emails.length >= 2 && groupName.trim().length > 0;

  const isLoading = isCreating || directMutation.isLoading || createConversationMutation.isLoading || groupMutation.isLoading;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" style={dialogStyles}>
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
          <DialogDescription>
            Démarrer un message direct ou créer un groupe
          </DialogDescription>
        </DialogHeader>

        {/* Conversation type selector */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={conversationType === "direct" ? undefined : "outline"}
            className={conversationType === "direct"
              ? (organizationId
                ? "flex-1 btn-white-label !bg-[var(--color-primary)] hover:!bg-[var(--color-primary)] hover:!opacity-90"
                : "flex-1 bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white hover:opacity-90")
              : "flex-1"}
            onClick={() => {
              setConversationType("direct");
              setEmails([]);
              setEmailInput("");
            }}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Message direct
          </Button>
          <Button
            variant={conversationType === "group" ? undefined : "outline"}
            className={conversationType === "group"
              ? (organizationId
                ? "flex-1 btn-white-label !bg-[var(--color-primary)] hover:!bg-[var(--color-primary)] hover:!opacity-90"
                : "flex-1 bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white hover:opacity-90")
              : "flex-1"}
            onClick={() => {
              setConversationType("group");
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            Créer un groupe
          </Button>
        </div>

        {/* Group details (only for group) */}
        {conversationType === "group" && (
          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Nom du groupe *</Label>
              <Input
                id="groupName"
                placeholder="Entrez le nom du groupe"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupDescription">Description (optionnel)</Label>
              <Textarea
                id="groupDescription"
                placeholder="De quoi parle ce groupe ?"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                maxLength={500}
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Selected emails */}
        {emails.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/50 rounded-md">
            {emails.map((email) => (
              <Badge
                key={email}
                className={organizationId
                  ? "pl-3 pr-1 btn-white-label !bg-[var(--color-primary)] text-white hover:!bg-[var(--color-primary)] hover:!opacity-90"
                  : "pl-3 pr-1 bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white border-0"
                }
              >
                <Mail className="h-3 w-3 mr-1" />
                {email}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-white/20 text-white"
                  onClick={() => handleRemoveEmail(email)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Single email input */}
        <div className="space-y-2">
          <Label htmlFor="emailInput">
            {conversationType === "direct"
              ? "Adresse email de l'utilisateur *"
              : "Ajouter des membres *"}
          </Label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="emailInput"
                type="email"
                placeholder="utilisateur@exemple.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            {conversationType === "group" && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddEmail}
                disabled={!emailInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {conversationType === "direct"
              ? "Entrez l'email et nous vérifierons l'utilisateur lors de la création"
              : "Appuyez sur Entrée ou cliquez sur + pour ajouter un email"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!canCreate || isLoading}
            className={organizationId ? "btn-white-label hover:opacity-90" : "bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white hover:opacity-90"}
          >
            {isLoading && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {conversationType === "direct" ? "Démarrer la discussion" : "Créer le groupe"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
