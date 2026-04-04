'use client';

/**
 * CreatableSelectField — Searchable + Creatable Select
 * Users can select from existing options OR type & create new ones
 * Fixed positioning issues - dropdown properly positioned relative to trigger
 */

import { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, X, Plus, Search as SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function CreatableSelectField({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select or type...',
  disabled = false,
  required = false,
  className = '',
  isMulti = false,
  error = '',
  hint = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customValues, setCustomValues] = useState([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Merge predefined + custom options
  const allOptions = [
    ...options,
    ...customValues.map(v => ({ value: v, label: v, isCustom: true }))
  ];

  // Filter based on search
  const filteredOptions = allOptions.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Check if option is selected
  const isSelected = (optionValue) => {
    if (isMulti) {
      return (Array.isArray(value) ? value : []).includes(optionValue);
    }
    return value === optionValue;
  };

  // Handle selection
  const handleSelect = (optionValue) => {
    if (disabled) return;

    if (isMulti) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(optionValue)
        ? currentValue.filter(v => v !== optionValue)
        : [...currentValue, optionValue];
      onChange?.(newValue);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearch('');
    }
  };

  // Handle remove for multi-select
  const handleRemove = (optionValue, e) => {
    e.stopPropagation();
    if (isMulti && Array.isArray(value)) {
      const newValue = value.filter(v => v !== optionValue);
      onChange?.(newValue);
    }
  };

  // Handle create new option
  const handleCreate = () => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return;
    
    if (customValues.includes(trimmedSearch) || allOptions.find(o => o.value === trimmedSearch)) {
      return;
    }

    setCustomValues(prev => [...prev, trimmedSearch]);
    handleSelect(trimmedSearch);
    setSearch('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Adjust dropdown position on scroll/resize
  useEffect(() => {
    if (!isOpen || !containerRef.current || !dropdownRef.current) return;

    const updatePosition = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdown = dropdownRef.current;
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = 320; // Approximate dropdown height
      
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        // Show above if not enough space below
        dropdown.style.top = 'auto';
        dropdown.style.bottom = '100%';
        dropdown.style.marginBottom = '8px';
      } else {
        // Show below by default
        dropdown.style.top = '100%';
        dropdown.style.bottom = 'auto';
        dropdown.style.marginTop = '8px';
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Get label for value
  const getLabel = (val) => {
    const option = allOptions.find(opt => opt.value === val);
    return option?.label || val;
  };

  // Get selected labels
  const selectedLabels = isMulti 
    ? (Array.isArray(value) ? value : []).map(getLabel)
    : (value ? [getLabel(value)] : []);

  // Check if search exactly matches any existing option
  const exactMatch = search.trim() && allOptions.find(o => o.value === search.trim());
  const canCreate = search.trim() && !exactMatch;

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <Label className="text-sm font-medium mb-1.5 block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {/* Main Display */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full min-h-[42px] rounded-xl border transition-all duration-200",
          "bg-white dark:bg-slate-900 px-3 py-2 text-sm",
          "flex flex-wrap items-center gap-1.5 cursor-pointer",
          error 
            ? "border-red-300 dark:border-red-700 hover:border-red-400" 
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
          isOpen && "ring-2 ring-emerald-500/20 border-emerald-500",
          disabled && "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800"
        )}
      >
        {/* Selected Items */}
        {isMulti && selectedLabels.length > 0 ? (
          <>
            {selectedLabels.slice(0, 3).map((label, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold group"
              >
                <span className="max-w-[120px] truncate">{label}</span>
                <button
                  onClick={(e) => handleRemove(Array.isArray(value) ? value[idx] : '', e)}
                  className="hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {selectedLabels.length > 3 && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                +{selectedLabels.length - 3}
              </span>
            )}
          </>
        ) : !isMulti && value ? (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold">
            {getLabel(value)}
          </div>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">{placeholder}</span>
        )}

        <ChevronDown
          className={cn(
            "h-4 w-4 ml-auto transition-transform duration-200 shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {/* Error/Hint Text */}
      {(error || hint) && (
        <p className={cn(
          "text-xs mt-1",
          error ? "text-red-500" : "text-slate-500"
        )}>
          {error || hint}
        </p>
      )}

      {/* Dropdown Menu - Positioned Absolutely */}
      {isOpen && !disabled && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            top: '100%', 
            left: 0,
            marginTop: '8px',
            maxHeight: '320px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canCreate) {
                    e.preventDefault();
                    handleCreate();
                  }
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                    setSearch('');
                  }
                }}
                placeholder="Search or type new..."
                className={cn(
                  "w-full pl-9 pr-3 py-2 text-sm rounded-lg",
                  "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
                  "placeholder:text-slate-400"
                )}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-[260px] p-1">
            {filteredOptions.length === 0 && !canCreate ? (
              <div className="text-center py-8 text-sm text-slate-500">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <p>No options found</p>
                <p className="text-xs mt-1">Type to create a new option</p>
              </div>
            ) : (
              <>
                {/* Filtered Options */}
                {filteredOptions.map((option, idx) => (
                  <button
                    key={`${option.value}-${idx}`}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg",
                      "hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150",
                      "cursor-pointer group",
                      isSelected(option.value) && "bg-emerald-50 dark:bg-emerald-900/20"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={cn(
                        "truncate",
                        isSelected(option.value) 
                          ? "text-emerald-700 dark:text-emerald-400 font-semibold" 
                          : "text-slate-700 dark:text-slate-300"
                      )}>
                        {option.label}
                      </span>
                      {option.isCustom && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold whitespace-nowrap">
                          Custom
                        </span>
                      )}
                    </div>
                    {isSelected(option.value) && (
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                    )}
                  </button>
                ))}

                {/* Create New Option Button */}
                {canCreate && (
                  <button
                    onClick={handleCreate}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg",
                      "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
                      "hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/40 dark:hover:to-teal-900/40",
                      "text-emerald-700 dark:text-emerald-400 font-semibold",
                      "border border-emerald-200 dark:border-emerald-800/50",
                      "transition-all duration-150 mt-1"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>Create "{search.trim()}"</span>
                    </div>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-emerald-200 dark:bg-emerald-800 rounded text-emerald-800 dark:text-emerald-200">
                      ↵
                    </kbd>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Footer with keyboard shortcuts */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <div className="flex gap-3">
                <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded text-xs">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded text-xs">↵</kbd> Select/Create</span>
                <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded text-xs">Esc</kbd> Close</span>
              </div>
              {isMulti && selectedLabels.length > 0 && (
                <span className="font-medium">{selectedLabels.length} selected</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}