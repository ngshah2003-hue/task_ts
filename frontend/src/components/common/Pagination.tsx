import { useEffect, useState, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import clsx from 'clsx';

export interface PaginationOption {
  value: number | '';
  label: string;
}

interface PaginationProps {
  currentPage: number;
  totalRecords: number;
  pageLimit: number | '';
  limitOptions: readonly PaginationOption[];
  onPageLimitChange: (limit: number | '') => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
  loading?: boolean;
  label?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalRecords,
  pageLimit,
  limitOptions,
  onPageLimitChange,
  onPreviousPage,
  onNextPage,
  onPageChange,
  loading = false,
  label = 'Lists',
}) => {
  const [pages, setPages] = useState<(number | string)[]>([]);

  const pagination = (current: number, totalPages: number): (number | string)[] => {
    if (totalPages <= 0) return [];
    const delta = 1;
    const left = current - delta;
    const right = current + delta + 1;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let last: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (last !== undefined) {
        if (i - last === 2) {
          rangeWithDots.push(last + 1);
        } else if (i - last !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      last = i;
    }

    return rangeWithDots;
  };

  const effectiveLimit = pageLimit === '' || pageLimit <= 0 ? totalRecords || 1 : pageLimit;
  const totalPages = Math.ceil(totalRecords / effectiveLimit) || 1;

  const calculatePages = useCallback(() => {
    const pageData = pagination(currentPage, totalPages);
    setPages(pageData);
  }, [totalRecords, effectiveLimit, currentPage, totalPages]);

  useEffect(() => {
    calculatePages();
  }, [calculatePages]);

  if (totalRecords <= 0 && pageLimit !== '') return null;

  return (
    <div className="d-flex flex-column flex-md-row flex-wrap align-items-center justify-content-between gap-2 gap-md-3 py-2 py-md-3 px-0 w-100 overflow-hidden">
      <div className="d-flex align-items-center gap-2 flex-shrink-0 order-1 order-md-0">
        <span className="small text-muted fw-medium">{label}</span>
        <Form.Select
          size="sm"
          value={String(pageLimit)}
          onChange={(e) => {
            const v = e.target.value;
            onPageLimitChange(v === '' ? '' : Number(v));
          }}
          style={{ width: 72 }}
          disabled={loading}
          className="form-select-sm"
        >
          {limitOptions.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </Form.Select>
        <span className="small text-muted d-none d-sm-inline">per page</span>
      </div>

      <div className="small text-muted text-center order-2 order-md-1 flex-grow-1" style={{ minWidth: 0 }}>
        Page <span className="fw-medium text-dark">{currentPage}</span> of{' '}
        <span className="fw-medium text-dark">{totalPages}</span> ({totalRecords} {label.toLowerCase()})
      </div>

      <nav className="d-flex align-items-center justify-content-center justify-content-md-end flex-shrink-0 order-3 order-md-2 overflow-auto" aria-label="Lists pagination">
        <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-center justify-content-md-end">
          <li className={clsx('page-item', (currentPage <= 1 || loading) && 'disabled')}>
            <button
              type="button"
              className="page-link"
              aria-label="Previous"
              disabled={currentPage <= 1 || loading}
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1 && !loading) onPreviousPage();
              }}
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
          {pages.map((val, index) => (
            <li
              key={`${val}-${index}`}
              className={clsx(
                'page-item',
                val === currentPage && 'active',
                val === '...' && 'disabled'
              )}
            >
              <button
                type="button"
                className="page-link"
                disabled={val === '...' || loading}
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof val === 'number' && !loading) onPageChange(val);
                }}
              >
                {val}
              </button>
            </li>
          ))}
          <li className={clsx('page-item', (currentPage >= totalPages || loading) && 'disabled')}>
            <button
              type="button"
              className="page-link"
              aria-label="Next"
              disabled={currentPage >= totalPages || loading}
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages && !loading) onNextPage();
              }}
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
