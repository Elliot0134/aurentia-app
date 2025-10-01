import { createBrowserRouter } from 'react-router-dom';
import OrganisationFormCreate from '../pages/organisation/OrganisationFormCreate';
import OrganisationForms from '../pages/organisation/OrganisationForms';
// ...other imports...

export const router = createBrowserRouter([
  // ...existing routes...
  {
    path: "/organisation/:id/forms/create",
    element: <OrganisationFormCreate />,
  },
  {
    path: "/organisation/:id/forms",
    element: <OrganisationForms />,
  },
  // ...other routes...
]);
