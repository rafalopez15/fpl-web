import type { ReactNode } from "react";
import { errorTitle, FPL_DOWN, LOADING, RETRY } from "@/lib/states";

// The states every page shares, each as a whole page. No hooks, so error.tsx files
// (Client Components) can use them too.

// A page's Suspense fallback. Not a root loading.tsx: streaming it before notFound()
// gives link-preview bots a 200 instead of a 404.
export function LoadingState() {
  return (
    <main aria-busy="true">
      <p className="muted" role="status">
        {LOADING}
      </p>
    </main>
  );
}

// For error.tsx: fplAPI failing, timing out or unreachable.
export function ErrorState({
  what,
  retry,
  children,
}: {
  what: string;
  retry: () => void;
  children?: ReactNode;
}) {
  return (
    <MessageState title={errorTitle(what)} message={FPL_DOWN}>
      <button type="button" className="button" onClick={() => retry()}>
        {RETRY}
      </button>
      {children}
    </MessageState>
  );
}

// For not-found.tsx, placeholders, and pages with nothing to show.
export function MessageState({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <main>
      <h1>{title}</h1>
      <p className="muted">{message}</p>
      {children && <p className="actions">{children}</p>}
    </main>
  );
}
