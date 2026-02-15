/** Display label for status (capitalized, "in_progress" → "In progress") */
export function getStatusLabel(status: string): string {
  if (status === 'in_progress') return 'In progress';
  if (status === 'todo') return 'Todo';
  if (status === 'done') return 'Done';
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

/** Bootstrap badge variant by status: todo=red, in_progress=yellow, done=green */
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
