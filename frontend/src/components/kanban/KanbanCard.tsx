import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, Button } from 'react-bootstrap';
import type { Card as CardType } from '../../api/kanbanApi';
import { getStatusLabel, getStatusBadgeVariant } from '../../utils/statusLabel';

interface KanbanCardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (cardId: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ card, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card._id,
    data: { listId: card.listId, card, index: card.order },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-2 cursor-grab active cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <Card.Body className="py-2 px-2">
        <div className="d-flex justify-content-between align-items-start gap-1">
          <div
            className="small flex-grow-1 cursor-pointer overflow-hidden"
            style={{ minWidth: 0, wordBreak: 'break-word', overflowWrap: 'break-word' }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onEdit(card)}
          >
            <div className="fw-medium text-break">{card.title}</div>
            {card.dueDate && (
              <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                Due: {new Date(card.dueDate).toLocaleDateString()}
              </div>
            )}
            <span
              className={`badge bg-${getStatusBadgeVariant(card.status)} mt-1 text-white`}
              style={{ fontSize: '0.65rem' }}
            >
              {getStatusLabel(card.status)}
            </span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <Button
              variant="link"
              size="sm"
              className="p-0 text-secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(card);
              }}
              aria-label="Edit card"
            >
              <i className="bi bi-pen" />
            </Button>
            <Button
              variant="link"
              size="sm"
              className="p-0 text-danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card._id);
              }}
              aria-label="Delete card"
            >
              <i className="bi bi-trash" />
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default KanbanCard;
