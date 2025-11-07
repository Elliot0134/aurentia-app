import React from 'react';
import { usePendingInvitations } from '@/hooks/usePendingInvitations';
import PendingInvitationsModal from './PendingInvitationsModal';

/**
 * Composant qui surveille automatiquement les invitations en attente
 * et affiche un popup quand l'utilisateur en a.
 * À intégrer dans App.tsx pour fonctionner sur toute l'application.
 */
interface PendingInvitationsProviderProps {
  children: React.ReactNode;
}

const PendingInvitationsProvider: React.FC<PendingInvitationsProviderProps> = ({ children }) => {
  const {
    invitations,
    showModal,
    handleInvitationAccepted,
  } = usePendingInvitations();

  return (
    <>
      {children}
      {invitations.length > 0 && (
        <PendingInvitationsModal
          isOpen={showModal}
          invitations={invitations}
          onInvitationAccepted={handleInvitationAccepted}
        />
      )}
    </>
  );
};

export default PendingInvitationsProvider;