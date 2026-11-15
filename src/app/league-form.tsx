"use client";

import { useActionState } from "react";
import { openLeague } from "./actions";

// A Client Component only to show the error; the form also works before JavaScript loads.
export function LeagueForm() {
  const [state, action, pending] = useActionState(openLeague, {});
  const describedBy = state.error ? "league-hint league-error" : "league-hint";

  return (
    <form action={action} className="league-form">
      <label htmlFor="league">Your mini-league</label>
      <p id="league-hint" className="muted">
        Paste the link to your league&apos;s standings from the FPL site, or
        type its number.
      </p>
      <div className="league-form-row">
        <input
          id="league"
          name="league"
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          required
          placeholder="League link or number"
          defaultValue={state.input}
          aria-describedby={describedBy}
          aria-invalid={state.error ? true : undefined}
        />
        <button type="submit" disabled={pending}>
          {pending ? "Opening…" : "Open"}
        </button>
      </div>
      {state.error && (
        <p id="league-error" role="alert" className="error">
          {state.error}
        </p>
      )}
    </form>
  );
}
