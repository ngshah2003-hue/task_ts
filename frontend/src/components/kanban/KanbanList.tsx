import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card as BSCard, Button, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../store/hooks';
import { updateListTitle, removeList, addCard } from '../../store/slices/boardDetailSlice';
import KanbanCard from './KanbanCard';
import ConfirmModal from '../common/ConfirmModal';
import type { List as ListType, Card as CardType } from '../../api/kanbanApi';
import { TITLE_MAX_LENGTH } from '../../utils/constants';

interface KanbanListProps {
  list: ListType;
  boardId: string;
  onEditCard: (card: CardType) => void;
  onDeleteCard: (cardId: string) => void;
}

const KanbanList: React.FC<KanbanListProps> = ({ list, boardId, onEditCard, onDeleteCard }) => {
  const dispatch = useAppDispatch();
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showConfirmDeleteList, setShowConfirmDeleteList] = useState(false);
  const [deletingList, setDeletingList] = useState(false);
  const [addCardLoading, setAddCardLoading] = useState(false);
  const [cardTitleTouched, setCardTitleTouched] = useState(false);
  const [cardSubmitAttempted, setCardSubmitAttempted] = useState(false);

  const { setNodeRef } = useDroppable({
    id: list._id,
    data: { listId: list._id, index: list.cards.length },
  });

  const listTitleInvalid = editingTitle && (!title.trim() || title.length > TITLE_MAX_LENGTH);

  const handleSaveTitle = async () => {
    const t = title.trim();
    if (!t || title.length > TITLE_MAX_LENGTH) return;
    if (t !== list.title) {
      try {
        await dispatch(updateListTitle({ boardId, listId: list._id, title: t })).unwrap();
        toast.success('List name edited successfully');
      } catch {
      }
    }
    setEditingTitle(false);
  };

  const handleDeleteList = () => setShowConfirmDeleteList(true);

  const handleConfirmDeleteList = async () => {
    setDeletingList(true);
    try {
      await dispatch(removeList({ boardId, listId: list._id })).unwrap();
      toast.success('List deleted successfully');
      setShowConfirmDeleteList(false);
    } finally {
      setDeletingList(false);
    }
  };

  const cardTitleInvalid = (cardTitleTouched || cardSubmitAttempted) && (!newCardTitle.trim() || newCardTitle.length > TITLE_MAX_LENGTH);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardSubmitAttempted(true);
    const t = newCardTitle.trim();
    if (!t || newCardTitle.length > TITLE_MAX_LENGTH) return;
    setAddCardLoading(true);
    try {
      await dispatch(addCard({ boardId, listId: list._id, title: t })).unwrap();
      toast.success('Card added successfully');
      setNewCardTitle('');
      setCardSubmitAttempted(false);
      setCardTitleTouched(false);
      setShowAddCard(false);
    } finally {
      setAddCardLoading(false);
    }
  };

  const cardIds = list.cards.map((c) => c._id);

  return (
    <BSCard ref={setNodeRef} className="w-100 flex-shrink-0" style={{ minWidth: 0, maxHeight: 'calc(100vh - 220px)' }}>
      <BSCard.Header className="py-2 d-flex align-items-center justify-content-between">
        {editingTitle ? (
          <div className="flex-grow-1 me-1 position-relative">
            <Form.Control
              size="sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              isInvalid={listTitleInvalid}
              maxLength={TITLE_MAX_LENGTH}
              autoFocus
            />
            {listTitleInvalid && (
              <Form.Control.Feedback type="invalid" className="small">
                {!title.trim() ? 'Title is required.' : `Max ${TITLE_MAX_LENGTH} characters.`}
              </Form.Control.Feedback>
            )}
          </div>
        ) : (
          <span
            className="fw-medium small text-break overflow-hidden"
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0 }}
            onClick={() => setEditingTitle(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(true)}
          >
            {list.title}
          </span>
        )}
        <div className="d-flex align-items-center gap-1">
          <Button
            variant="link"
            size="sm"
            className="p-0 text-secondary"
            onClick={() => setEditingTitle(true)}
            aria-label="Edit list"
          >
            <i className="bi bi-pencil-square" style={{ fontSize: '1.1rem' }} />
          </Button>
          <Button
            variant="link"
            size="sm"
            className="p-0 text-danger"
            onClick={handleDeleteList}
            aria-label="Delete list"
          >
            <i className="bi bi-trash" style={{ fontSize: '1.1rem' }} />
          </Button>
        </div>
      </BSCard.Header>
      <BSCard.Body className="py-2 overflow-auto" style={{ minHeight: 60 }}>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div>
            {list.cards.length === 0 ? (
              <div className="text-center py-3 text-muted small">
                No cards found
              </div>
            ) : (
              list.cards.map((card) => (
                <KanbanCard
                  key={card._id}
                  card={card}
                  onEdit={onEditCard}
                  onDelete={onDeleteCard}
                />
              ))
            )}
          </div>
        </SortableContext>
        <ConfirmModal
          show={showConfirmDeleteList}
          title="Delete list"
          message={`Delete list "${list.title}" and all its cards?`}
          confirmLabel="Delete"
          variant="danger"
          loading={deletingList}
          onConfirm={handleConfirmDeleteList}
          onCancel={() => !deletingList && setShowConfirmDeleteList(false)}
        />
        {showAddCard ? (
          <Form onSubmit={handleAddCard} className="mt-2">
            <Form.Control
              size="sm"
              placeholder="Card title"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onBlur={() => setCardTitleTouched(true)}
              isInvalid={cardTitleInvalid}
              maxLength={TITLE_MAX_LENGTH}
              autoFocus
              className="mb-2"
              disabled={addCardLoading}
            />
            {cardTitleInvalid && (
              <Form.Control.Feedback type="invalid" className="d-block small mb-2">
                {!newCardTitle.trim() ? 'Card title is required.' : `Max ${TITLE_MAX_LENGTH} characters.`}
              </Form.Control.Feedback>
            )}
            <div className="d-flex gap-1">
              <Button type="submit" size="sm" variant="primary" disabled={addCardLoading || !newCardTitle.trim() || newCardTitle.length > TITLE_MAX_LENGTH}>
                {addCardLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    Adding…
                  </>
                ) : (
                  'Add'
                )}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                type="button"
                onClick={() => {
                  if (!addCardLoading) {
                    setShowAddCard(false);
                    setNewCardTitle('');
                    setCardTitleTouched(false);
                    setCardSubmitAttempted(false);
                  }
                }}
                disabled={addCardLoading}
              >
                Cancel
              </Button>
            </div>
          </Form>
        ) : (
          <Button variant="outline-secondary" size="sm" className="w-100 mt-1" onClick={() => setShowAddCard(true)}>
            + Add card
          </Button>
        )}
      </BSCard.Body>
    </BSCard>
  );
};

export default KanbanList;
