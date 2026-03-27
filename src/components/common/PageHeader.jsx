/**
 * PageHeader
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   title       string     required
 *   description string     optional subtitle
 *   action      ReactNode  optional top-right slot (e.g. <Button>)
 *   breadcrumb  ReactNode  optional breadcrumb above the title
 *
 * Usage:
 *   <PageHeader
 *     title="Students"
 *     description="Manage all enrolled students"
 *     action={<Button onClick={openModal}>+ Add Student</Button>}
 *   />
 */
export default function PageHeader({ title, description, action, breadcrumb }) {
  return (
    <div className="mb-6 flex flex-col gap-1">
      {breadcrumb && <div className="mb-1">{breadcrumb}</div>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {action && (
          <div className="flex shrink-0 items-center gap-2">{action}</div>
        )}
      </div>
    </div>
  );
}
