import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import type { Card as CardType } from '../../api/kanbanApi';
import { cardStatuses } from '../../api/kanbanApi';
import { getStatusLabel } from '../../utils/statusLabel';
import { TITLE_MAX_LENGTH } from '../../utils/constants';

interface CardModalProps {
  card: CardType;
  onClose: () => void;
  onSave: (body: { title?: string; dueDate?: string | null; status?: string }) => Promise<void>;
}

const CardModal: React.FC<CardModalProps> = ({ card, onClose, onSave }) => {
  const [title, setTitle] = useState(card.title);
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.slice(0, 10) : '');
  const [status, setStatus] = useState(card.status);
  const [titleTouched, setTitleTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(card.title);
    setDueDate(card.dueDate ? card.dueDate.slice(0, 10) : '');
    setStatus(card.status);
    setTitleTouched(false);
    setSubmitAttempted(false);
  }, [card]);

  const titleEmpty = !title.trim();
  const titleOverMax = title.length > TITLE_MAX_LENGTH;
  const titleInvalid = (titleTouched || submitAttempted) && (titleEmpty || titleOverMax);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const t = title.trim();
    if (!t || title.length > TITLE_MAX_LENGTH) return;
    setSaving(true);
    try {
      await onSave({
        title: t,
        dueDate: dueDate ? dueDate : null,
        status,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show onHide={() => !saving && onClose()}>
      <Modal.Header closeButton>
        <Modal.Title>Edit card</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitleTouched(true)}
              isInvalid={titleInvalid}
              maxLength={TITLE_MAX_LENGTH}
              disabled={saving}
            />
            {titleInvalid && (
              <Form.Control.Feedback type="invalid">
                {titleEmpty ? 'Title is required.' : `Title must be ${TITLE_MAX_LENGTH} characters or less.`}
              </Form.Control.Feedback>
            )}
            <Form.Text className="text-muted">{title.length}/{TITLE_MAX_LENGTH}</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Due date</Form.Label>
            <Form.Control
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={saving}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select value={status} onChange={(e) => setStatus(e.target.value)} disabled={saving}>
              {cardStatuses.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={saving || !title.trim() || title.length > TITLE_MAX_LENGTH}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving…
              </>
            ) : (
              'Save'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CardModal;
