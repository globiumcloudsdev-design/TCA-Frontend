/**
 * DataTable â€” Advanced generic table using @tanstack/react-table v8
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Props:
 *   columns               ColumnDef[]
 *   data                  any[]
 *   loading               boolean
 *   emptyMessage          string
 *   pagination            { page, totalPages, onPageChange, total? } | null
 *   enableRowSelection    boolean    â€” prepends a checkbox column
 *   onRowSelectionChange  (rows[]) => void
 *   enableColumnVisibility boolean  â€” shows "Columns" toggle button
 *   selectionActions      ReactNode â€” rendered above table when rows are selected
 *
 *   Built-in Toolbar (search + filters) - pass these props to enable:
 *   search                string
 *   onSearch              (val: string) => void
 *   searchPlaceholder     string
 *   filters               { name, label, value, onChange, options: {value,label}[] }[]
 *   action                ReactNode  â€” top-right slot (e.g. Add button)
 *
 * Usage:
 *   <DataTable
 *     columns={columns}
 *     data={students}
 *     loading={isLoading}
 *     search={search}
 *     onSearch={setSearch}
 *     searchPlaceholder="Search studentsâ€¦"
 *     filters={[{ name: 'status', label: 'Status', value: status, onChange: setStatus, options: STATUS_OPTIONS }]}
 *     action={<Button>+ Add</Button>}
 *     enableColumnVisibility
 *     pagination={{ page, totalPages, onPageChange: setPage, total: 150 }}
 *   />
 */
'use client';

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState, useEffect, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Columns3,
  Search,
  X,
  SlidersHorizontal,
  Download,
} from 'lucide-react';
import ExportModal from './ExportModal';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AppPagination from './AppPagination';
import EmptyState from './EmptyState';

// â”€â”€â”€ Selection checkbox column â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SELECTION_COLUMN = {
  id: '__select__',
  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected()
          ? true
          : table.getIsSomePageRowsSelected()
            ? 'indeterminate'
            : false
      }
      onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(v) => row.toggleSelected(!!v)}
      aria-label="Select row"
      onClick={(e) => e.stopPropagation()}
    />
  ),
  enableSorting: false,
  enableHiding: false,
  size: 40,
};

// â”€â”€â”€ Debounced Search Input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SearchBox({ value: ext = '', onChange, placeholder = 'Searchâ€¦' }) {
  const [local, setLocal] = useState(ext);

  useEffect(() => { setLocal(ext); }, [ext]);
  useEffect(() => {
    const t = setTimeout(() => onChange?.(local), 350);
    return () => clearTimeout(t);
  }, [local]); // eslint-disable-line

  return (
    <div className="relative w-full sm:w-64">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-8 pr-8 h-9 text-sm"
      />
      {local && (
        <button
          type="button"
          onClick={() => { setLocal(''); onChange?.(''); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function DataTable({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  pagination = null,
  enableRowSelection = false,
  onRowSelectionChange,
  enableColumnVisibility = false,
  selectionActions,
  // â”€â”€ Built-in toolbar â”€â”€
  search,
  onSearch,
  searchPlaceholder,
  filters = [],
  action,
  onRowClick,
  // ── Export ──
  exportConfig = null,   // { fileName: string, dateField?: string }
}) {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});
  const [exportOpen, setExportOpen] = useState(false);

  // Prepend selection column when enabled
  const finalColumns = useMemo(
    () => (enableRowSelection ? [SELECTION_COLUMN, ...columns] : columns),
    [columns, enableRowSelection],
  );

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: { sorting, rowSelection, columnVisibility },
    enableRowSelection,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
  });

  // Notify parent when selection changes
  useEffect(() => {
    if (!onRowSelectionChange) return;
    const selected = table.getSelectedRowModel().rows.map((r) => r.original);
    onRowSelectionChange(selected);
  }, [rowSelection]); // eslint-disable-line

  const selectedCount = table.getSelectedRowModel().rows.length;
  const totalRows = pagination?.total ?? data.length;

  const hasToolbar = onSearch || filters.length > 0 || action || enableColumnVisibility || exportConfig;

  // ── Export rows: nested objects/arrays ko flatten karta hai ──────────────
  const exportRows = useMemo(() => {
    // Agar page ne khud banaye hain toh wahi use karo
    if (exportConfig?.exportRows) return exportConfig.exportRows;   // ← add karo
    return data.map((row) => {
      const out = {};
      columns.forEach((col) => {
        const key = col.accessorKey ?? col.id ?? '';
        if (!key || key === 'select' || key === 'actions' || key === '__select__') return;

        let value;

        // 1. accessorFn support
        if (col.accessorFn) {
          value = col.accessorFn(row, 0);
        }
        // 2. nested dotted key: "details.employee_id" → row.details?.employee_id
        else if (col.accessorKey?.includes('.')) {
          value = col.accessorKey.split('.').reduce(
            (obj, k) => (obj != null ? obj[k] : ''),
            row
          );
        }
        // 3. direct key
        else {
          value = row[key];
        }

        // ── Flatten value ──────────────────────────────────────────
        if (value === null || value === undefined) {
          out[key] = '';
        }
        // Array → "Section A, Section B"
        else if (Array.isArray(value)) {
          out[key] = value
            .map((item) => {
              if (typeof item !== 'object') return String(item);
              return (
                item.name ||
                item.label ||
                item.title ||
                `${item.first_name || ''} ${item.last_name || ''}`.trim() ||
                item.email || ''
              );
            })
            .filter(Boolean)
            .join(', ');
        }
        // Object → meaningful string
        else if (typeof value === 'object') {
          // Academic year special case
          if (value.start_year && value.end_year) {
            out[key] = `${value.start_year}-${value.end_year}`;
          } else {
            out[key] =
              value.name ||
              value.label ||
              value.title ||
              `${value.first_name || ''} ${value.last_name || ''}`.trim() ||
              value.email ||
              value.phone ||
              '';
          }
        }
        // Primitive
        else {
          out[key] = value;
        }
      });
      return out;
    });
  }, [data, columns]);

  return (
    <div className="w-full min-w-0 space-y-3">

      {/* â•â•â•â•â•â•â•â•â•â• TOOLBAR â•â•â•â•â•â•â•â•â•â• */}
      {hasToolbar && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          {/* Left: search + filters */}
          <div className="flex flex-wrap items-center gap-2">
            {onSearch && (
              <SearchBox
                value={search}
                onChange={onSearch}
                placeholder={searchPlaceholder ?? 'Searchâ€¦'}
              />
            )}

            {filters.length > 0 && (
              <>
                {/* On sm+: show filters inline */}
                <div className="hidden sm:flex items-center gap-2 flex-wrap">
                  {filters.map((f) => (
                    <Select
                      key={f.name}
                      value={f.value ?? ''}
                      onValueChange={(v) => f.onChange(v === '__all__' ? '' : v)}
                    >
                      <SelectTrigger className="h-9 w-36 text-sm">
                        <SelectValue placeholder={f.label} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All {f.label}</SelectItem>
                        {f.options.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}
                </div>

                {/* On mobile: filters dropdown */}
                <div className="flex sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm">
                        <SlidersHorizontal size={14} />
                        Filters
                        {filters.some((f) => f.value) && (
                          <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 p-3 space-y-3">
                      <DropdownMenuLabel className="px-0 py-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Filters
                      </DropdownMenuLabel>
                      {filters.map((f) => (
                        <div key={f.name}>
                          <p className="mb-1 text-xs font-medium text-foreground">{f.label}</p>
                          <Select
                            value={f.value ?? ''}
                            onValueChange={(v) => f.onChange(v === '__all__' ? '' : v)}
                          >
                            <SelectTrigger className="h-8 w-full text-xs">
                              <SelectValue placeholder={`All ${f.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all__">All {f.label}</SelectItem>
                              {f.options.map((opt) => (
                                <SelectItem key={opt.value} value={String(opt.value)}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                      {filters.some((f) => f.value) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-7 text-xs text-muted-foreground"
                          onClick={() => filters.forEach((f) => f.onChange(''))}
                        >
                          <X size={12} className="mr-1" /> Clear all
                        </Button>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>

          {/* Right: action + column visibility */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Selection feedback */}
            {enableRowSelection && selectedCount > 0 && (
              <>
                <span className="text-sm text-muted-foreground">
                  {selectedCount} selected
                </span>
                {selectionActions}
              </>
            )}

            {enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm">
                    <Columns3 size={14} /> Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((col) => col.getCanHide())
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        className="capitalize"
                        checked={col.getIsVisible()}
                        onCheckedChange={(v) => col.toggleVisibility(v)}
                      >
                        {col.columnDef.header ?? col.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {exportConfig && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-sm"
                onClick={() => setExportOpen(true)}
              >
                <Download size={14} /> Export
              </Button>
            )}

            {action}
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportConfig && (
        <ExportModal
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          columns={columns}
          // rows={data}
          rows={exportRows}    // ✅ processed, flattened rows
          fileName={exportConfig.fileName ?? 'export'}
          dateField={exportConfig.dateField ?? null}
        />
      )}

      {/* â•â•â•â•â•â•â•â•â•â• TABLE â•â•â•â•â•â•â•â•â•â•
          The border div clips to w-full of the grid column.
          Table (shadcn) wrapper has overflow-auto; giving the <table>
          a min-w forces that overflow-auto to actually produce a scrollbar
          on narrow viewports instead of stretching the page.
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="rounded-lg border w-full">
        <Table className="min-w-[700px]">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                {hg.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  return (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap font-semibold text-foreground"
                      style={{
                        width: header.column.columnDef.size,
                        cursor: canSort ? 'pointer' : 'default',
                      }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span className="inline-flex items-center gap-1 select-none">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="text-muted-foreground">
                            {isSorted === 'asc' && <ChevronUp size={13} />}
                            {isSorted === 'desc' && <ChevronDown size={13} />}
                            {!isSorted && <ChevronsUpDown size={13} className="opacity-40" />}
                          </span>
                        )}
                      </span>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {finalColumns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={finalColumns.length} className="py-0">
                  <EmptyState description={emptyMessage} />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className={`hover:bg-muted/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ══════════ FOOTER: row count + rows-per-page + pagination ══════════ */}
      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">

          {/* Left: record count + rows-per-page selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-xs text-muted-foreground">
              {!loading && data.length > 0
                ? `Showing ${data.length} of ${totalRows} records`
                : !loading ? '' : ''}
            </p>

            {pagination.onPageSizeChange && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page</span>
                <Select
                  value={String(pagination.pageSize ?? 10)}
                  onValueChange={(v) => {
                    pagination.onPageSizeChange(Number(v));
                  }}
                >
                  <SelectTrigger className="h-7 w-[60px] text-xs px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 25, 50, 100].map((n) => (
                      <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Right: pagination */}
          <AppPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}

      {/* No-pagination record count */}
      {!pagination && !loading && data.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {data.length} record{data.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
