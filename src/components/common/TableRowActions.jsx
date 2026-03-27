/**
 * TableRowActions — Edit / Delete (and custom) dropdown for table rows
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   onEdit    () => void           optional
 *   onDelete  () => void           optional
 *   onView    () => void           optional
 *   extra     { label, icon, onClick, variant? }[]   additional items
 *   disabled  boolean
 *
 * Usage:
 *   <TableRowActions
 *     onView={() => router.push(`/students/${row.id}`)}
 *     onEdit={() => openEditModal(row)}
 *     onDelete={() => handleDelete(row.id)}
 *   />
 */
'use client';

import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TableRowActions({ onView, onEdit, onDelete, extra = [], disabled }) {
  const hasDestructive = !!onDelete;
  const hasAny = onView || onEdit || onDelete || extra.length;

  if (!hasAny) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={disabled} className="h-8 w-8">
          <MoreHorizontal size={16} />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[130px]">
        {onView && (
          <DropdownMenuItem onClick={onView}>
            <Eye size={14} className="mr-2" /> View
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil size={14} className="mr-2" /> Edit
          </DropdownMenuItem>
        )}

        {extra.map((item, i) => (
          <DropdownMenuItem
            key={i}
            onClick={item.onClick}
            className={item.variant === 'destructive' ? 'text-destructive focus:text-destructive' : ''}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}

        {hasDestructive && (onView || onEdit || extra.length > 0) && (
          <DropdownMenuSeparator />
        )}

        {onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 size={14} className="mr-2" /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
