import { useEffect, useState } from 'react';
import { Card as BSCard, Spinner } from 'react-bootstrap';
import * as kanbanApi from '../../api/kanbanApi';

const ACTION_LABELS: Record<string, string> = {
  card_created: 'created card',
  card_moved: 'moved card',
  card_updated: 'updated card',
  card_deleted: 'deleted card',
  list_created: 'created list',
  list_deleted: 'deleted list',
};

function formatActivity(
  item: kanbanApi.ActivityItem | kanbanApi.ActivityItemWithBoard,
  options?: { boardTitle?: string }
): string {
  const who = item.userId?.name || item.userId?.email || 'Someone';
  const label = ACTION_LABELS[item.actionType] || item.actionType;
  const card = item.cardTitle ? `"${item.cardTitle}"` : '';
  const list = item.listTitle ? `"${item.listTitle}"` : '';
  const from = item.fromListTitle ? ` from "${item.fromListTitle}"` : '';
  const to = item.toListTitle ? ` to "${item.toListTitle}"` : '';
  const boardTitle = options?.boardTitle ?? (item as kanbanApi.ActivityItemWithBoard).boardId?.title;
  const prefix = boardTitle ? `[${boardTitle}] ` : '';

  let line: string;
  switch (item.actionType) {
    case 'card_created':
      line = `${who} ${label} ${card} in list ${list}`.trim();
      break;
    case 'card_moved':
      line = `${who} moved ${card}${from}${to}`.trim();
      break;
    case 'card_updated':
    case 'card_deleted':
      line = `${who} ${label} ${card}`.trim();
      break;
    case 'list_created':
    case 'list_deleted':
      line = `${who} ${label} ${list}`.trim();
      break;
    default:
      line = `${who} ${label}`.trim();
  }
  return prefix + line;
}

interface ActivityLogProps {
  boardId?: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ boardId }) => {
  const [activities, setActivities] = useState<(kanbanApi.ActivityItem | kanbanApi.ActivityItemWithBoard)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = { page: 1, limit: 30 };
    const promise = boardId
      ? kanbanApi.getBoardActivity(boardId, params)
      : kanbanApi.getMyActivity(params);
    promise
      .then((res) => {
        if (!cancelled) {
          setActivities(res.activities);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(kanbanApi.getApiError(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  return (
    <BSCard className="shadow-sm">
      <BSCard.Header className="py-2 small fw-medium text-muted">Activity</BSCard.Header>
      <BSCard.Body className="py-2 px-3" style={{ maxHeight: 240, overflowY: 'auto' }}>
        {loading && (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
          </div>
        )}
        {error && <div className="small text-danger">{error}</div>}
        {!loading && !error && activities.length === 0 && (
          <div className="small text-muted">No activity yet.</div>
        )}
        {!loading && !error && activities.length > 0 && (
          <ul className="list-unstyled mb-0 small">
            {activities.map((item) => (
              <li key={item._id} className="py-1 border-bottom border-light">
                {formatActivity(item)}
                <span className="text-muted ms-1">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </BSCard.Body>
    </BSCard>
  );
};

export default ActivityLog;
