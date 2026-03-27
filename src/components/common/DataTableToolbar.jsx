/**
 * DataTableToolbar — Search + filter bar for DataTable
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   search        string
 *   onSearch      (val: string) => void
 *   searchPlaceholder string
 *   filters       { name, label, options: {value,label}[], value, onChange }[]   optional filter selects
 *   action        ReactNode    optional top-right action (e.g. Add button)
 *
 * Usage:
 *   <DataTableToolbar
 *     search={search}
 *     onSearch={setSearch}
 *     filters={[{ name: 'status', label: 'Status', options: FEE_STATUS, value: status, onChange: setStatus }]}
 *     action={<Button>+ Add</Button>}
 *   />
 */
'use client';

import SearchInput from './SearchInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DataTableToolbar({
  search = '',
  onSearch,
  searchPlaceholder,
  filters = [],
  action,
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {onSearch && (
        <SearchInput
          value={search}
          onChange={onSearch}
          placeholder={searchPlaceholder}
          className="w-full max-w-xs"
        />
      )}

      {filters.map((f) => (
        <Select
          key={f.name}
          value={f.value ?? ''}
          onValueChange={(v) => f.onChange(v === '__all__' ? '' : v)}
        >
          <SelectTrigger className="w-40">
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

      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}
