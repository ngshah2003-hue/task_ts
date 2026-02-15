import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBoards, createBoard, removeBoard, clearError } from '../store/slices/boardsSlice';
import ConfirmModal from '../components/common/ConfirmModal';
import ActivityLog from '../components/kanban/ActivityLog';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: boards, total: totalBoards, loading, error } = useAppSelector((s) => s.boards);
  const fetchStarted = useRef(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleTouched, setNewTitleTouched] = useState(false);
  const [createSubmitAttempted, setCreateSubmitAttempted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (fetchStarted.current) return;
    fetchStarted.current = true;
    dispatch(fetchBoards());
    return () => {
      fetchStarted.current = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitAttempted(true);
    const title = newTitle.trim();
    if (!title) return;
    setCreating(true);
    try {
      await dispatch(createBoard(title)).unwrap();
      setNewTitle('');
      setCreateSubmitAttempted(false);
      setNewTitleTouched(false);
      setShowCreate(false);
      toast.success('Board created');
    } catch (err) {
      toast.error(String(err));
    } finally {
      setCreating(false);
    }
  };

  const newTitleInvalid = (newTitleTouched || createSubmitAttempted) && !newTitle.trim();

  const handleDeleteClick = (boardId: string) => setBoardToDelete(boardId);

  const handleConfirmDeleteBoard = async () => {
    if (!boardToDelete) return;
    setDeletingId(boardToDelete);
    try {
      await dispatch(removeBoard(boardToDelete)).unwrap();
      toast.success('Board deleted');
      setBoardToDelete(null);
    } catch (err) {
      toast.error(String(err));
    } finally {
      setDeletingId(null);
    }
  };

  const formatCreatedAt = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h4 mb-1 fw-bold text-primary">
            Your Boards {totalBoards >= 0 && <span className="text-muted fw-normal">({totalBoards})</span>}
          </h1>
          <p className="text-muted small mb-0">Manage your projects and tasks</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <i className="bi bi-plus-lg me-2" />
          Create Board
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : boards.length === 0 ? (
        <Card className="border-0 bg-light">
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-3">No boards yet. Create one to get started.</p>
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <i className="bi bi-plus-lg me-2" />
              Create board
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="row g-3">
          {boards.map((board) => (
            <div key={board._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="position-relative d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <i className="bi bi-kanban text-primary" style={{ fontSize: '1.5rem' }} />
                    <Button
                      variant="link"
                      size="sm"
                      className="p-2 text-danger position-absolute"
                      style={{ top: '0.5rem', right: '0.5rem' }}
                      onClick={() => handleDeleteClick(board._id)}
                      disabled={deletingId === board._id}
                      aria-label="Delete board"
                    >
                      {deletingId === board._id ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      ) : (
                        <i className="bi bi-trash" style={{ fontSize: '1.15rem' }} />
                      )}
                    </Button>
                  </div>
                  <Card.Title className="h6 mt-2 mb-3 text-break">
                    <Link to={`/boards/${board._id}`} className="text-decoration-none text-dark fw-bold">
                      {board.title}
                    </Link>
                  </Card.Title>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="mt-auto align-self-start"
                    onClick={() => navigate(`/boards/${board._id}`)}
                  >
                    Open Board
                  </Button>
                  {board.createdAt && (
                    <small className="text-muted mt-3 d-block">
                      Created: {formatCreatedAt(board.createdAt)}
                    </small>
                  )}
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <ActivityLog />
      </div>

      <ConfirmModal
        show={boardToDelete !== null}
        title="Delete board"
        message="Delete this board and all its lists and cards?"
        confirmLabel="Delete"
        variant="danger"
        loading={deletingId !== null}
        onConfirm={handleConfirmDeleteBoard}
        onCancel={() => !deletingId && setBoardToDelete(null)}
      />

      <Modal show={showCreate} onHide={() => !creating && setShowCreate(false)}>
        <Modal.Header closeButton>
          <Modal.Title>New board</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Board name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Work tasks"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={() => setNewTitleTouched(true)}
                isInvalid={newTitleInvalid}
                maxLength={200}
                disabled={creating}
              />
              {newTitleInvalid && (
                <Form.Control.Feedback type="invalid">Board name is required.</Form.Control.Feedback>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreate(false)} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creating || !newTitle.trim()}>
              {creating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creating…
                </>
              ) : (
                'Create'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Dashboard;
