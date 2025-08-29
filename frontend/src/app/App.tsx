import { useRoutes }
  from 'react-router-dom';
import routes
  from './MainRoutes.tsx';

const App = () => {
  const routing = useRoutes(routes);
  return <>{routing}</>;
};

export default App;
