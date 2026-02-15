export function getStatusLabel(status: string): string {
  if (status === 'in_progress') return 'In progress';
  if (status === 'todo') return 'Todo';
  if (status === 'done') return 'Done';
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

export function getStatusBadgeVariant(status: string): string {
  switch (status) {
    case 'todo':
      return 'danger';
    case 'in_progress':
      return 'warning';
    case 'done':
      return 'success';
    default:
      return 'secondary';
  }
}
