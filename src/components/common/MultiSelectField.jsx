// src/components/common/MultiSelectField.jsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

function MultiSelectFieldBase({
  label,
  name,
  control,
  options = [],
  value = [],
  onChange,
  error,
  placeholder = 'Select options...',
  disabled = false,
  required = false,
  maxHeight = '200px',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const selectedValues = Array.isArray(value) ? value : [];
  const emitChange = (nextValue) => {
    if (typeof onChange === 'function') {
      onChange(nextValue);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Check if option is selected
  const isSelected = (optionValue) => {
    return selectedValues.includes(optionValue);
  };

  // Toggle selection
  const toggleOption = (optionValue) => {
    if (disabled) return;
    
    let newValue;
    if (isSelected(optionValue)) {
      newValue = selectedValues.filter(v => v !== optionValue);
    } else {
      newValue = [...selectedValues, optionValue];
    }
    emitChange(newValue);
  };

  // Remove a single selected item
  const removeItem = (itemValue, e) => {
    e.stopPropagation();
    if (disabled) return;
    const newValue = selectedValues.filter(v => v !== itemValue);
    emitChange(newValue);
  };

  // Get label for a value
  const getLabel = (val) => {
    const option = options.find(opt => opt.value === val);
    return option?.label || val;
  };

  return (
    <div className={cn("space-y-2", className)} ref={containerRef}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        {/* Selected Items Display */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer",
            "flex flex-wrap items-center gap-1.5",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        >
          {selectedValues.length > 0 ? (
            <>
              {selectedValues.slice(0, 3).map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {getLabel(item)}
                  {!disabled && (
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => removeItem(item, e)}
                    />
                  )}
                </Badge>
              ))}
              {selectedValues.length > 3 && (
                <Badge variant="outline">+{selectedValues.length - 3}</Badge>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          
          <ChevronDown className={cn(
            "h-4 w-4 ml-auto transition-transform",
            isOpen && "rotate-180"
          )} />
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg">
            {/* Search Input */}
            <div className="p-2 border-b">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options List */}
            <div 
              className="overflow-y-auto p-1"
              style={{ maxHeight }}
            >
              {filteredOptions.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 text-sm rounded-sm cursor-pointer hover:bg-accent",
                      isSelected(option.value) && "bg-accent"
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected(option.value) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-destructive mt-1">{error.message || error}</p>
      )}
    </div>
  );
}

export default function MultiSelectField(props) {
  const { name, control, ...rest } = props;

  if (!control) {
    return <MultiSelectFieldBase name={name} {...rest} />;
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <MultiSelectFieldBase
          name={name}
          value={field.value ?? []}
          onChange={field.onChange}
          {...rest}
        />
      )}
    />
  );
}