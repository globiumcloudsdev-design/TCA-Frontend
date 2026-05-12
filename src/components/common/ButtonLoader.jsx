import { Loader2 } from "lucide-react";

/**
 * ButtonLoader
 * ─────────────────────────────────────────────────────────────────
 * A small spinner to be used inside buttons during loading states.
 */
export default function ButtonLoader({ className = "h-4 w-4" }) {
  return (
    <Loader2 className={`animate-spin ${className}`} />
  );
}
