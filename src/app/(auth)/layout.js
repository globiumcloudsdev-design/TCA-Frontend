/**
 * (auth) group layout
 * Centered card, no sidebar.
 */
export const metadata = { title: 'Sign In' };

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-muted/40 px-4 py-10 sm:items-center">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            ☁ The Clouds Academy
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Institute Management System</p>
        </div>
        {children}
      </div>
    </div>
  );
}
