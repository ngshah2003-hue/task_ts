import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCredentials } from '../store/slices/authSlice';

const Navigation: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const displayName = user?.name?.trim() || user?.email || 'User';

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold text-primary">
          SimpleKanban
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="nav" />
        <Navbar.Collapse id="nav">
          <Nav className="ms-auto align-items-center gap-2">
            <div className="d-flex flex-column align-items-end">
              <span className="text-dark small">Hello, {displayName}</span>
              {user?.email && (
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {user.email}
                </span>
              )}
            </div>
            <Nav.Link as={Link} to="/dashboard" className="text-dark">
              Dashboard
            </Nav.Link>
            <Button variant="outline-danger" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
