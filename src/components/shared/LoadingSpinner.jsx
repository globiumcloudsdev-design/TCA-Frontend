/**
 * LoadingSpinner — centred full-page spinner
 */
export default function LoadingSpinner({ size = 'md' }) {
  const classes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex items-center justify-center p-8">
      <span
        className={`${classes[size]} animate-spin rounded-full border-primary border-t-transparent`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
