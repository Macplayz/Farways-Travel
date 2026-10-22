'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  Inbox,
  Filter,
} from 'lucide-react';

export interface ColumnDef<T = any> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableActions<T = any> {
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  customActions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: T) => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

export interface DataTableProps<T = any> {
  columns: ColumnDef<T>[];
  data: T[];
  actions?: DataTableActions<T>;
  searchPlaceholder?: string;
  searchKeys?: string[];
  isLoading?: boolean;
  emptyMessage?: string;
  onCreateNew?: () => void;
  createButtonLabel?: string;
  title?: string;
  subtitle?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  actions,
  searchPlaceholder = 'Search by name, ID, city or code...',
  searchKeys,
  isLoading = false,
  emptyMessage = 'No inventory records found matching your query.',
  onCreateNew,
  createButtonLabel = 'Add Record',
  title,
  subtitle,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Auto-detect search keys if not explicitly provided
  const effectiveSearchKeys = useMemo(() => {
    if (searchKeys && searchKeys.length > 0) return searchKeys;
    if (data.length === 0) return ['id', 'name', 'title'];
    const sample = data[0];
    const candidateKeys = [
      'id',
      'name',
      'title',
      'city',
      'location',
      'airline_name',
      'airlineName',
      'flight_number',
      'flightNumber',
      'train_name',
      'trainName',
      'train_number',
      'trainNumber',
      'vehicle_model',
      'vehicleModel',
      'route_origin',
      'routeOrigin',
      'route_destination',
      'routeDestination',
      'operator_name',
      'operatorName',
    ];
    return candidateKeys.filter((k) => k in sample);
  }, [searchKeys, data]);

  // Handle Search Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase().trim();

    return data.filter((row) => {
      // Check specific search keys first
      for (const key of effectiveSearchKeys) {
        const val = row[key];
        if (val !== undefined && val !== null && String(val).toLowerCase().includes(term)) {
          return true;
        }
      }

      // Fallback: search across all top-level string/number values
      return Object.values(row).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(term);
        }
        return false;
      });
    });
  }, [data, searchTerm, effectiveSearchKeys]);

  // Handle Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Handle Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, safeCurrentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const hasActions = actions && (actions.onEdit || actions.onDelete || actions.onView || (actions.customActions && actions.customActions.length > 0));

  return (
    <div className="space-y-4">
      {/* Top Header & Search Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>

          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-ocean to-cyan-600 hover:from-ocean-dark hover:to-cyan-700 text-white text-xs font-bold shadow-md shadow-ocean/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{createButtonLabel}</span>
            </button>
          )}
        </div>

        {/* Search Bar & Result Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Counter / Filter Info */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-cyan-400" />
              <span>
                {filteredData.length === data.length
                  ? `${data.length} total records`
                  : `Showing ${filteredData.length} of ${data.length}`}
              </span>
            </span>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
              aria-label="Rows per page"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800">
                {columns.map((col) => {
                  const isSortable = col.sortable !== false;
                  const isSorted = sortKey === col.key;

                  return (
                    <th
                      key={col.key}
                      onClick={() => isSortable && handleSort(col.key)}
                      className={`px-4 py-3 text-[11px] font-bold tracking-wider uppercase select-none text-slate-400 ${
                        isSortable ? 'cursor-pointer hover:text-white transition-colors' : ''
                      } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
                        col.className || ''
                      }`}
                    >
                      <div
                        className={`inline-flex items-center gap-1.5 ${
                          col.align === 'right' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <span>{col.header}</span>
                        {isSortable && (
                          <span className="text-slate-500">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                              )
                            ) : (
                              <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}

                {hasActions && (
                  <th className="px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-right text-slate-400">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length + (hasActions ? 1 : 0)}
                    className="py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
                      <span className="text-xs font-semibold">
                        Querying Supabase PostgreSQL...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (hasActions ? 1 : 0)}
                    className="py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mb-1">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-slate-300">
                        No Records Found
                      </span>
                      <p className="text-xs text-slate-500">{emptyMessage}</p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="mt-2 text-xs font-semibold text-cyan-400 hover:underline"
                        >
                          Clear active search filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => {
                  const rowId = row.id || `row-${index}`;

                  return (
                    <tr
                      key={rowId}
                      className="odd:bg-slate-900/60 even:bg-slate-900/20 hover:bg-slate-800/60 transition-colors group"
                    >
                      {columns.map((col) => {
                        const cellValue = row[col.key];

                        return (
                          <td
                            key={col.key}
                            className={`px-4 py-3.5 text-xs text-slate-200 ${
                              col.align === 'right'
                                ? 'text-right'
                                : col.align === 'center'
                                ? 'text-center'
                                : 'text-left'
                            } ${col.className || ''}`}
                          >
                            {col.render ? col.render(row) : (
                              <span className="truncate block max-w-xs">
                                {cellValue !== undefined && cellValue !== null
                                  ? String(cellValue)
                                  : '—'}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {hasActions && (
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {actions.onEdit && (
                              <button
                                onClick={() => actions.onEdit!(row)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit Record"
                                aria-label={`Edit ${row.name || row.id || 'item'}`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {actions.customActions?.map((action, i) => {
                              const ActionIcon = action.icon;
                              return (
                                <button
                                  key={i}
                                  onClick={() => action.onClick(row)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                  title={action.label}
                                >
                                  {ActionIcon ? <ActionIcon className="w-3.5 h-3.5" /> : action.label}
                                </button>
                              );
                            })}

                            {actions.onDelete && (
                              <button
                                onClick={() => actions.onDelete!(row)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Delete Record"
                                aria-label={`Delete ${row.name || row.id || 'item'}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Bar */}
        {!isLoading && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing{' '}
              <span className="font-bold text-white">
                {(safeCurrentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-bold text-white">
                {Math.min(safeCurrentPage * pageSize, totalItems)}
              </span>{' '}
              of <span className="font-bold text-white">{totalItems}</span> entries
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-cyan-300">
                {safeCurrentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
