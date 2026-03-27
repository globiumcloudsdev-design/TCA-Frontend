/**
 * SearchInput — debounced search with leading icon
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   value         string
 *   onChange      (val: string) => void
 *   placeholder   string
 *   debounceMs    number   default 400
 *   className     string
 *
 * Usage:
 *   const [search, setSearch] = useState('');
 *   <SearchInput value={search} onChange={setSearch} placeholder="Search students…" />
 */
'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function SearchInput({
  value: externalValue = '',
  onChange,
  placeholder = 'Search…',
  debounceMs = 400,
  className,
}) {
  const [local, setLocal] = useState(externalValue);

  // Keep local in sync if parent resets value
  useEffect(() => { setLocal(externalValue); }, [externalValue]);

  // Debounce upward
  useEffect(() => {
    const t = setTimeout(() => onChange?.(local), debounceMs);
    return () => clearTimeout(t);
  }, [local, debounceMs, onChange]);

  return (
    <div className={cn('relative', className)}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {local && (
        <button
          type="button"
          onClick={() => { setLocal(''); onChange?.(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
