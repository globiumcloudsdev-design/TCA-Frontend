/**
 * ErrorAlert — API error display
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   message  string | null   if null, renders nothing
 *   title    string          default "Something went wrong"
 *
 * Usage:
 *   <ErrorAlert message={errorMessage} />
 */
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ErrorAlert({ message, title = 'Something went wrong' }) {
  if (!message) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle size={16} />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
