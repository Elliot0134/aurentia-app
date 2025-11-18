import CreateProjectFlow from '@/components/project/CreateProjectFlow';
import usePageTitle from '@/hooks/usePageTitle';

const CreateProjectForm = () => {
  usePageTitle("Créer un Projet");
  return <CreateProjectFlow />;
};

export default CreateProjectForm;
