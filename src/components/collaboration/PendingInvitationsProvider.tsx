import React from 'react';
import { usePendingInvitations } from '@/hooks/usePendingInvitations';
import PendingInvitationsModal from './PendingInvitationsModal';

/**
 * Composant qui surveille automatiquement les invitations en attente
 * et affiche un popup quand l'utilisateur en a.
 * À intégrer dans App.tsx pour fonctionner sur toute l'application.
 */
const PendingInvitationsProvider: React.FC = () => {
  const {
    invitations,
    showModal,
    handleInvitationAccepted,
  } = usePendingInvitations();

  if (invitations.length === 0) {
    return null;
  }

  return (
    <PendingInvitationsModal
      isOpen={showModal}
      invitations={invitations}
      onInvitationAccepted={handleInvitationAccepted}
    />
  );
};

export default PendingInvitationsProvider;