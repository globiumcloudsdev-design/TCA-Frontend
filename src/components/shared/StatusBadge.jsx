/**
 * StatusBadge — coloured pill for status values
 * Colour presets: success | warning | danger | info | default
 */
const VARIANTS = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  danger:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  default: 'bg-muted text-muted-foreground',
};

export default function StatusBadge({ label, variant = 'default' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}>
      {label}
    </span>
  );
}
