import React from 'react';
import InvitationDialog from './InvitationDialog';
import { UserPlus } from 'lucide-react';

interface DeliverableInviteButtonProps {
  projectId?: string;
  onInvitationSent?: () => void;
  className?: string;
}

const DeliverableInviteButton: React.FC<DeliverableInviteButtonProps> = ({
  projectId,
  onInvitationSent,
  className = ""
}) => {
  return (
    <InvitationDialog
      defaultProjectId={projectId}
      onInvitationSent={onInvitationSent}
      buttonText="Inviter"
      buttonVariant="outline"
      buttonSize="sm"
      showProjectSelector={false}
      trigger={
        <button 
          className={`flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors ${className}`}
        >
          <UserPlus className="w-3 h-3" />
          Inviter
        </button>
      }
    />
  );
};

export default DeliverableInviteButton;