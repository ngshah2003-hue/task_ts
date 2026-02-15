import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Container, Spinner, Card as BSCard, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBoardDetail,
  addList,
  removeList,
  updateCard,
  removeCard,
  moveCardThunk,
  moveCardLocal,
  clearBoardDetail,
  clearError,
} from '../store/slices/boardDetailSlice';
import * as kanbanApi from '../api/kanbanApi';
import type { Card as CardType } from '../api/kanbanApi';
import { cardStatuses } from '../api/kanbanApi';
import KanbanList from '../components/kanban/KanbanList';
import CardModal from '../components/kanban/CardModal';
import ConfirmModal from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import { useDebounce } from '../hooks/useDebounce';
import { getStatusLabel, getStatusBadgeVariant } from '../utils/statusLabel';

const SEARCH_DEBOUNCE_MS = 400;
const POLL_INTERVAL_MS = 15000;
const LIST_LIMIT_OPTIONS = [
  { value: '', label: 'All' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 30, label: '30' },
] as const;
const ALL_LISTS_LIMIT = 500;

const BoardDetail: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { board, lists, totalLists, totalPages, loading, error } = useAppSelector(
    s => s.boardDetail,
  );
  const currentUser = useAppSelector(s => s.auth.user);
  const currentUserId = currentUser?._id;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const debouncedSearch = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [deletingCard, setDeletingCard] = useState(false);
  const [addListLoading, setAddListLoading] = useState(false);
  const [listTitleTouched, setListTitleTouched] = useState(false);
  const [listSubmitAttempted, setListSubmitAttempted] = useState(false);
  const [listLimit, setListLimit] = useState<number | ''>(10);
  const [listPage, setListPage] = useState(1);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [members, setMembers] = useState<{ members: kanbanApi.BoardMemberItem[]; invitations: kanbanApi.BoardInvitationItem[] } | null>(null);
  const fetchParamsRef = useRef({ listPage: 1, listLimit: 10, debouncedSearch: '', statusFilter: '', hasLists: false });

  const hasLists = lists.length > 0;
  const filterDisabled = !hasLists;

  useEffect(() => {
    return () => {
      dispatch(clearBoardDetail());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!boardId) return;
    if (filterDisabled && (debouncedSearch || statusFilter)) return;
    const limit = listLimit === '' ? ALL_LISTS_LIMIT : listLimit;
    const passFilters = lists.length > 0;
    fetchParamsRef.current = {
      listPage,
      listLimit: limit,
      debouncedSearch,
      statusFilter,
      hasLists: lists.length > 0,
    };
    dispatch(
      fetchBoardDetail({
        boardId,
        params: {
          ...(passFilters
            ? { q: debouncedSearch || undefined, status: statusFilter || undefined }
            : {}),
          listPage,
          listLimit: limit,
        },
      }),
    );
  }, [boardId, debouncedSearch, statusFilter, listPage, listLimit, dispatch]);

  useEffect(() => {
    if (!boardId) return;
    const interval = setInterval(() => {
      const { listPage: p, listLimit: lim, debouncedSearch: q, statusFilter: st, hasLists } = fetchParamsRef.current;
      dispatch(
        fetchBoardDetail({
          boardId,
          params: {
            ...(hasLists ? { q: q || undefined, status: st || undefined } : {}),
            listPage: p,
            listLimit: lim,
          },
        }),
      );
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [boardId, dispatch]);

  useEffect(() => {
    setListPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const list = lists.find(l => l.cards.some(c => c._id === active.id));
    const card = list?.cards.find(c => c._id === active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || !boardId) return;
    const cardId = String(active.id);
    const overData = over.data.current;
    const toListId = overData?.listId as string | undefined;
    const toIndex = typeof overData?.index === 'number' ? overData.index : 0;
    if (!toListId) return;
    const fromList = lists.find(l => l.cards.some(c => c._id === cardId));
    if (!fromList) return;
    const fromListId = fromList._id;
    dispatch(moveCardLocal({ cardId, fromListId, toListId, toIndex }));
    dispatch(moveCardThunk({ cardId, listId: toListId, position: toIndex })).catch(() => {
      dispatch(
        fetchBoardDetail({
          boardId: boardId!,
          params: { q: debouncedSearch || undefined, status: statusFilter || undefined },
        }),
      );
    });
  };

  const listTitleInvalid = (listTitleTouched || listSubmitAttempted) && !newListTitle.trim();

  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    setListSubmitAttempted(true);
    const title = newListTitle.trim();
    if (!title || !boardId) return;
    setAddListLoading(true);
    try {
      await dispatch(addList({ boardId, title })).unwrap();
      toast.success('List added successfully');
      setNewListTitle('');
      setListSubmitAttempted(false);
      setListTitleTouched(false);
      setListPage(1);
      dispatch(
        fetchBoardDetail({
          boardId,
          params: {
            ...(hasLists
              ? { q: debouncedSearch || undefined, status: statusFilter || undefined }
              : {}),
            listPage: 1,
            listLimit: listLimit === '' ? ALL_LISTS_LIMIT : listLimit,
          },
        }),
      );
    } catch (err) {
      toast.error(String(err));
    } finally {
      setAddListLoading(false);
    }
  };

  if (!boardId) {
    navigate('/dashboard');
    return null;
  }

  if (loading && !board) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!board) {
    return (
      <Container className="py-5">
        <p className="text-muted">Board not found.</p>
        <Button variant="link" onClick={() => navigate('/dashboard')}>
          Back to boards
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3 px-2 px-md-3">
      <div className="d-flex flex-wrap align-items-center gap-2 gap-md-3 mb-3 py-1">
        <Button
          variant="outline-secondary"
          onClick={() => navigate('/dashboard')}
          className="flex-shrink-0"
        >
          ← Boards
        </Button>
        <h1 className="h5 mb-0 text-truncate flex-grow-1" style={{ minWidth: 0 }}>
          {board.title}
        </h1>
        <InputGroup className="flex-grow-1" style={{ maxWidth: 340, minWidth: 220 }}>
          <InputGroup.Text className="bg-white text-muted">
            <i className="bi bi-search" aria-hidden />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search cards…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={filterDisabled}
          />
          <Form.Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            disabled={filterDisabled}
            style={{ maxWidth: 150 }}
          >
            <option value="">All statuses</option>
            {cardStatuses.map(s => (
              <option key={s} value={s}>
                {getStatusLabel(s)}
              </option>
            ))}
          </Form.Select>
        </InputGroup>
        <Form
          onSubmit={handleAddList}
          className="d-flex align-items-center gap-2 flex-wrap flex-grow-1"
          style={{ minWidth: 0 }}
        >
          <Form.Control
            placeholder="List title"
            value={newListTitle}
            onChange={e => setNewListTitle(e.target.value)}
            onBlur={() => setListTitleTouched(true)}
            isInvalid={listTitleInvalid}
            className="flex-grow-1"
            style={{ maxWidth: 220, minWidth: 120 }}
            disabled={addListLoading}
          />
          <Button
            type="submit"
            variant="outline-primary"
            disabled={addListLoading || !newListTitle.trim()}
            className="flex-shrink-0"
          >
            {addListLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Adding…
              </>
            ) : (
              '+ Add list'
            )}
          </Button>
          {listTitleInvalid && (
            <Form.Control.Feedback
              type="invalid"
              className="d-block small position-absolute"
              style={{ top: '100%' }}
            >
              List title is required.
            </Form.Control.Feedback>
          )}
        </Form>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="position-relative">
          {loading && (
            <div
              className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center bg-white bg-opacity-75 rounded"
              style={{ zIndex: 10 }}
            >
              <Spinner animation="border" />
            </div>
          )}
          {!loading && lists.length === 0 ? (
            <div className="text-center py-5 text-muted">No lists found</div>
          ) : (
            <div
              className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-2 gy-4 mb-4 justify-content-start"
              style={{ minHeight: 400 }}
            >
              {lists.map(list => (
                <div key={list._id} className="col d-flex">
                  <KanbanList
                    list={list}
                    boardId={boardId}
                    onEditCard={setEditingCard}
                    onDeleteCard={cardId => setCardToDelete(cardId)}
                  />
                </div>
              ))}
            </div>
          )}

          {totalLists > 0 && lists.length > 0 && (
            <BSCard className="w-100 shadow-sm overflow-hidden">
              <BSCard.Body className="p-2 p-md-3">
                <Pagination
                  currentPage={listPage}
                  totalRecords={totalLists}
                  pageLimit={listLimit}
                  limitOptions={LIST_LIMIT_OPTIONS}
                  onPageLimitChange={limit => {
                    setListLimit(limit);
                    setListPage(1);
                  }}
                  onPreviousPage={() => setListPage(p => Math.max(1, p - 1))}
                  onNextPage={() => setListPage(p => Math.min(totalPages || 1, p + 1))}
                  onPageChange={setListPage}
                  loading={loading}
                  label="Lists"
                />
              </BSCard.Body>
            </BSCard>
          )}

        </div>

        <DragOverlay>
          {activeCard ? (
            <BSCard className="shadow" style={{ width: 260 }}>
              <BSCard.Body className="py-2">
                <div className="small fw-medium text-break" style={{ wordBreak: 'break-word' }}>
                  {activeCard.title}
                </div>
                {activeCard.dueDate && (
                  <div className="small text-muted mt-1">
                    Due {new Date(activeCard.dueDate).toLocaleDateString()}
                  </div>
                )}
              </BSCard.Body>
            </BSCard>
          ) : null}
        </DragOverlay>
      </DndContext>

      {editingCard && (
        <CardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onSave={async body => {
            await dispatch(updateCard({ cardId: editingCard._id, body })).unwrap();
            toast.success('Card updated successfully');
            setEditingCard(null);
          }}
        />
      )}

      <ConfirmModal
        show={cardToDelete !== null}
        title="Delete card"
        message="Are you sure you want to delete this card?"
        confirmLabel="Delete"
        variant="danger"
        loading={deletingCard}
        onConfirm={async () => {
          if (!cardToDelete) return;
          setDeletingCard(true);
          try {
            await dispatch(removeCard(cardToDelete)).unwrap();
            toast.success('Card deleted successfully');
            setCardToDelete(null);
          } finally {
            setDeletingCard(false);
          }
        }}
        onCancel={() => !deletingCard && setCardToDelete(null)}
      />

      <Modal show={showInviteModal} onHide={() => { setShowInviteModal(false); setInviteEmail(''); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Board members</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            className="mb-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!boardId || !inviteEmail.trim()) return;
              setInviteLoading(true);
              try {
                await kanbanApi.inviteToBoard(boardId, inviteEmail.trim());
                toast.success('Invitation sent');
                setInviteEmail('');
                const res = await kanbanApi.getBoardMembers(boardId);
                setMembers(res);
              } catch (err) {
                toast.error(kanbanApi.getApiError(err));
              } finally {
                setInviteLoading(false);
              }
            }}
          >
            <InputGroup size="sm">
              <Form.Control
                type="email"
                placeholder="Email to invite"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button type="submit" variant="primary" disabled={inviteLoading}>
                {inviteLoading ? 'Sending…' : 'Send invite'}
              </Button>
            </InputGroup>
          </Form>
          {members && (
            <>
              <div className="small fw-medium text-muted mb-1">Members</div>
              <ul className="list-unstyled small mb-3">
                {members.members.map((m) => (
                  <li key={m._id} className="d-flex align-items-center justify-content-between py-1">
                    <span>{m.userId?.name || m.userId?.email || m.userId?._id}</span>
                    {board?.owner !== m.userId?._id && (currentUserId === board?.owner || currentUserId === m.userId?._id) && (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={async () => {
                          if (!boardId) return;
                          try {
                            await kanbanApi.removeBoardMember(boardId, m.userId._id);
                            toast.success('Member removed');
                            const res = await kanbanApi.getBoardMembers(boardId);
                            setMembers(res);
                          } catch (err) {
                            toast.error(kanbanApi.getApiError(err));
                          }
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              <div className="small fw-medium text-muted mb-1">Pending invitations</div>
              <ul className="list-unstyled small mb-0">
                {members.invitations.map((inv) => (
                  <li key={inv._id} className="d-flex align-items-center justify-content-between py-1">
                    <span>{inv.email}</span>
                    {currentUserId === board?.owner && (
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={async () => {
                        if (!boardId) return;
                        try {
                          await kanbanApi.cancelBoardInvite(boardId, inv._id);
                          toast.success('Invitation cancelled');
                          const res = await kanbanApi.getBoardMembers(boardId);
                          setMembers(res);
                        } catch (err) {
                          toast.error(kanbanApi.getApiError(err));
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    )}
                  </li>
                ))}
                {members.invitations.length === 0 && <li className="text-muted">None</li>}
              </ul>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default BoardDetail;
