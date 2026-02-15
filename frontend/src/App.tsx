import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import { Container } from 'react-bootstrap';
import { useAppSelector } from './store/hooks';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BoardDetail from './pages/BoardDetail';
import AcceptInvitePage from './pages/AcceptInvitePage';

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const GuestRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const getCurrentYear = (): number => new Date().getFullYear();

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="d-flex flex-column min-vh-100">
    <Navigation />
    <main className="flex-grow-1">{children}</main>
    <footer className="bg-light text-center py-3 mt-auto">
      <Container>
        <small className="text-muted">© {getCurrentYear()} Task boards</small>
      </Container>
    </footer>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/boards/:boardId"
            element={
              <ProtectedRoute>
                <BoardDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accept-invite"
            element={
              <ProtectedRoute>
                <AcceptInvitePage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
