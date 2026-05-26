import { useRoutes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useBootstrap } from './hooks/useBootstrap';
import { useStore } from './store';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';

export default function App() {
  const ready = useBootstrap();
  const navigate = useStore((s) => s.navigate);
  const location = useLocation();

  // Sync browser URL into store on direct load / back/forward
  useEffect(() => {
    navigate(location.pathname);
  }, [location.pathname, navigate]);

  if (!ready) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return useRoutes([
    { path: '/login', element: <LoginPage /> },
    { path: '*', element: <Layout /> },
  ]);
}
