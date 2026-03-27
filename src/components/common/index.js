/**
 * ─────────────────────────────────────────────────────────────────
 *  Central export for ALL reusable common components
 *  Usage: import { DataTable, ConfirmDialog, StatsCard } from '@/components/common'
 * ─────────────────────────────────────────────────────────────────
 */

// Layout
export { default as PageHeader }        from './PageHeader';
export { default as SectionHeader }     from './SectionHeader';
export { default as PageLoader }        from './PageLoader';
export { default as EmptyState }        from './EmptyState';

// Stats & Cards
export { default as StatsCard }         from './StatsCard';

// Table
export { default as DataTable }         from './DataTable';
export { default as DataTableToolbar }  from './DataTableToolbar';
export { default as TableRowActions }   from './TableRowActions';
export { default as AppPagination }     from './AppPagination';

// Dialogs & Modals
export { default as ConfirmDialog }     from './ConfirmDialog';
export { default as AppModal }          from './AppModal';
export { default as ExportModal }       from './ExportModal';

// Form Fields
export { default as InputField }        from './InputField';
export { default as TextareaField }     from './TextareaField';
export { default as SelectField }       from './SelectField';
export { default as CheckboxField }     from './CheckboxField';
export { default as SwitchField }       from './SwitchField';
export { default as DatePickerField }   from './DatePickerField';
export { default as FormSubmitButton }  from './FormSubmitButton';

// Inputs
export { default as SearchInput }       from './SearchInput';

// Display
export { default as StatusBadge }       from './StatusBadge';
export { default as AvatarWithInitials } from './AvatarWithInitials';
export { default as ErrorAlert }        from './ErrorAlert';
export { default as AppBreadcrumb }     from './AppBreadcrumb';

// Nav / Auth
export { default as ThemeToggle }       from './ThemeToggle';
export { default as NotificationBell }  from './NotificationBell';
export { default as UserMenu }          from './UserMenu';
export { default as BranchSwitcher }    from './BranchSwitcher';
export { default as BranchInitializer } from './BranchInitializer';

// Permission
export { default as PermissionGuard }   from '../shared/PermissionGuard';
