import { MessageLayout } from "@/components/messages/MessageLayout";
import { useOrganisationData } from "@/hooks/useOrganisationData";
import { useParams } from "react-router-dom";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const OrganisationMessages = () => {
  const { id } = useParams<{ id: string }>();
  const { organisation, loading } = useOrganisationData(id);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!organisation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Organization not found</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <MessageLayout organizationId={organisation.id} />
    </div>
  );
};

export default OrganisationMessages;
