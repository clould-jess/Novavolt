import React, { useMemo, useState } from 'react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export interface Column<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right';
  /** Kept out of the mobile card summary when false. */
  showOnMobile?: boolean;
  /** The main identifying column, used as the mobile card title. */
  primary?: boolean;
}

interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  pageSize?: number;
  actions?: (row: T) => React.ReactNode;
}

/** Table on md+, stacked cards on mobile. Sorting and pagination included. */
export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyState,
  pageSize = 8,
  actions
}: DataTableProps<T>) {
  const { t } = useI18n();
  const [sort, setSort] = useState<{id: string;dir: 'asc' | 'desc';} | null>(null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.id === sort.id);
    if (!column?.sortValue) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * (sort.dir === 'asc' ? 1 : -1);
    });
    return copy;
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const visible = sorted.slice(current * pageSize, current * pageSize + pageSize);
  const primary = columns.find((column) => column.primary) ?? columns[0];

  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-card border border-line bg-white md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line bg-soft">
              {columns.map((column) => {
                const sortable = Boolean(column.sortValue);
                const active = sort?.id === column.id;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={active ? sort?.dir === 'asc' ? 'ascending' : 'descending' : undefined}
                    className={cn(
                      'whitespace-nowrap px-4 py-3 text-[0.75rem] font-semibold uppercase tracking-wide text-muted',
                      column.align === 'right' && 'text-right'
                    )}>
                    
                    {sortable ?
                    <button
                      type="button"
                      onClick={() =>
                      setSort((prev) =>
                      prev?.id === column.id ?
                      { id: column.id, dir: prev.dir === 'asc' ? 'desc' : 'asc' } :
                      { id: column.id, dir: 'asc' }
                      )
                      }
                      className={cn(
                        'inline-flex items-center gap-1 transition-colors duration-150 hover:text-ink',
                        active && 'text-action'
                      )}>
                      
                        {column.header}
                        {active && sort?.dir === 'asc' ?
                      <ChevronUpIcon className="h-3.5 w-3.5" aria-hidden="true" /> :

                      <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      }
                      </button> :

                    column.header
                    }
                  </th>);

              })}
              {actions &&
              <th scope="col" className="px-4 py-3 text-right text-[0.75rem] font-semibold uppercase tracking-wide text-muted">
                  {t('common.actions')}
                </th>
              }
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((row) =>
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn('bg-white transition-colors duration-150', onRowClick && 'cursor-pointer hover:bg-soft')}>
              
                {columns.map((column) =>
              <td
                key={column.id}
                className={cn('px-4 py-3.5 align-middle text-2xs text-body', column.align === 'right' && 'text-right')}>
                
                    {column.cell(row)}
                  </td>
              )}
                {actions && <td className="px-4 py-3.5 text-right">{actions(row)}</td>}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="flex flex-col gap-3 md:hidden">
        {visible.map((row) =>
        <li key={rowKey(row)} className="rounded-card border border-line bg-white p-4">
            <button
            type="button"
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className="w-full text-left"
            disabled={!onRowClick}>
            
              <div className="text-sm font-semibold text-ink">{primary.cell(row)}</div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                {columns.
              filter((column) => column.id !== primary.id && column.showOnMobile !== false).
              map((column) =>
              <div key={column.id} className="min-w-0">
                      <dt className="text-[0.75rem] font-medium text-muted">{column.header}</dt>
                      <dd className="mt-0.5 truncate text-2xs text-body">{column.cell(row)}</dd>
                    </div>
              )}
              </dl>
            </button>
            {actions && <div className="mt-3 flex justify-end border-t border-line pt-3">{actions(row)}</div>}
          </li>
        )}
      </ul>

      {pageCount > 1 &&
      <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-[0.75rem] text-muted">
            {sorted.length} {t('common.results')}
          </p>
          <div className="flex items-center gap-2">
            <Button
            size="sm"
            variant="secondary"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
            iconLeft={<ChevronLeftIcon className="h-4 w-4" />}>
            
              {t('common.previous')}
            </Button>
            <span className="text-[0.75rem] font-semibold text-muted">
              {current + 1} / {pageCount}
            </span>
            <Button
            size="sm"
            variant="secondary"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
            iconRight={<ChevronRightIcon className="h-4 w-4" />}>
            
              {t('common.next')}
            </Button>
          </div>
        </div>
      }
    </div>);

}