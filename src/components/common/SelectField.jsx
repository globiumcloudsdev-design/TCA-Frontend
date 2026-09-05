/**
 * SelectField — react-hook-form compatible Select with label + error
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   label       string
 *   name        string
 *   control     UseFormControl  (react-hook-form Controller)
 *   error       FieldError
 *   options     { value: string, label: string }[]
 *   placeholder string
 *   required    boolean
 *   disabled    boolean
 *   className   string
 *
 * Usage:
 *   <SelectField
 *     label="Gender"
 *     name="gender"
 *     control={control}
 *     error={errors.gender}
 *     options={GENDER_OPTIONS}
 *     placeholder="Select gender"
 *     required
*   />
 */
'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StatusBadge from '@/components/common/StatusBadge';
import { Label } from '@/components/ui/label';
import { cn, sanitizeFieldLabel } from '@/lib/utils';

const PollingTripwire = ({ onReachBottom, isFetchingNextPage }) => {
  const tripwireRef = useRef(null);

  useEffect(() => {
    if (!onReachBottom || isFetchingNextPage) return;

    const checkVisibility = () => {
      const tripwire = tripwireRef.current;
      if (!tripwire) return;

      // Find the Radix viewport bounding box dynamically
      const viewport = tripwire.closest('[data-radix-select-viewport]');
      if (!viewport) return;

      const vRect = viewport.getBoundingClientRect();
      const tRect = tripwire.getBoundingClientRect();

      // True screen coordinate math: is the top of the tripwire inside the bottom of the viewport?
      if (tRect.top <= vRect.bottom + 20 && tRect.bottom >= vRect.top) {
        console.log("DOM Tripwire touched! Fetching...");
        onReachBottom();
      }
    };

    // Poll every 250ms (only runs while dropdown is open)
    const intervalId = setInterval(checkVisibility, 250);
    return () => clearInterval(intervalId);
  }, [onReachBottom, isFetchingNextPage]);

  return (
    <div ref={tripwireRef} className="flex w-full justify-center py-2 mt-1">
      {isFetchingNextPage ? (
        <span className="text-xs text-muted-foreground italic">Loading...</span>
      ) : (
        <div className="h-1 w-full" />
      )}
    </div>
  );
};

export default function SelectField({
  label,
  name,
  control,
  value,
  onChange,
  defaultValue,
  error,
  options = [],
  placeholder = 'Select…',
  required,
  disabled,
  className,
  rules,
  onReachBottom,
  hasMore = false,
  isLoadingMore = false,
}) {
  // Ensure options is always an array, even if it's an object or other type
  const optionsArray = Array.isArray(options) 
    ? options 
    : typeof options === 'object' && options !== null
      ? Object.values(options)
      : [];

  const normalizedOptions = useMemo(() => {
    const seen = new Set();
    return (optionsArray || [])
      .map((opt) => {
        if (typeof opt === 'string' || typeof opt === 'number') {
          return { value: String(opt), label: String(opt) };
        }
        if (typeof opt === 'object' && opt !== null) {
          const val = opt.value !== undefined ? opt.value : (opt.id !== undefined ? opt.id : '');
          const lbl = opt.label !== undefined ? opt.label : (opt.name !== undefined ? opt.name : String(val));
          return {
            ...opt,
            value: String(val ?? ''),
            label: String(lbl ?? ''),
          };
        }
        return null;
      })
      .filter((opt) => {
        if (!opt || String(opt.value).trim() === '') return false;
        if (seen.has(opt.value)) return false;
        seen.add(opt.value);
        return true;
      });
  }, [optionsArray]);

  const { labelText, isRequired } = sanitizeFieldLabel(label, required);

  return (
    <div className={cn('space-y-1.5', className)}>
      {labelText && (
        <Label htmlFor={name}>
          {labelText}
          {isRequired && <span className="ml-0.5 text-destructive font-semibold">*</span>}
        </Label>
      )}

      {control ? (
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field }) => {
            const selectValue = (field.value !== undefined && field.value !== null && String(field.value) !== '')
              ? String(field.value)
              : undefined;

            return (
              <Select
                value={selectValue}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger id={name} aria-invalid={!!error}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {normalizedOptions.length > 0 ? (
                    normalizedOptions.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        <span className="flex items-center justify-between gap-2 w-full">
                          <span>{opt.label}</span>
                          {opt.badgeStatus ? (
                            <StatusBadge status={opt.badgeStatus} label={opt.badgeLabel || 'Current'} />
                          ) : null}
                        </span>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-[11px] text-slate-400 text-center italic">
                      No options found
                    </div>
                  )}

                  {/* Inject the Polling Tripwire here */}
                  {onReachBottom && (
                    <PollingTripwire isFetchingNextPage={isLoadingMore} onReachBottom={onReachBottom} />
                  )}
                </SelectContent>
              </Select>
            );
          }}
        />
      ) : (
        <Select
          value={(value !== undefined && value !== null && String(value) !== '') ? String(value) : undefined}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger id={name} aria-invalid={!!error}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {normalizedOptions.length > 0 ? (
              normalizedOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  <span className="flex items-center justify-between gap-2 w-full">
                    <span>{opt.label}</span>
                    {opt.badgeStatus ? (
                      <StatusBadge status={opt.badgeStatus} label={opt.badgeLabel || 'Current'} />
                    ) : null}
                  </span>
                </SelectItem>
              ))
            ) : (
              <div className="p-4 text-[11px] text-slate-400 text-center italic">
                No options found
              </div>
            )}

            {/* Inject the Polling Tripwire here */}
            {onReachBottom && (
              <PollingTripwire isFetchingNextPage={isLoadingMore} onReachBottom={onReachBottom} />
            )}
          </SelectContent>
        </Select>
      )}

      {error && (
        <p className="text-xs text-destructive">
          {typeof error === 'string' ? error : error.message}
        </p>
      )}
    </div>
  );
}
