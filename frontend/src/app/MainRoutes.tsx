import type {
  RouteObject
} from 'react-router-dom';
import mainRoutes
  from '../modules/indexRoutes.tsx';
import { NotFound }
  from '../components/index.ts';

const routes: RouteObject[] = [
  ...mainRoutes,
  {
    path: '*',
    element: (<NotFound />),
  },
];

export default routes;
