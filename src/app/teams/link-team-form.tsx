"use client";

import { useActionState, useState } from "react";
import { LINK } from "@/lib/teams";
import { findTeam, linkTeam } from "./actions";

// A Client Component for the lookup's state; both steps also work before JavaScript
// loads.
export function LinkTeamForm() {
  const [state, action, pending] = useActionState(findTeam, {});
  // Editing the ID after a lookup starts over, as on iOS.
  const [editedAfter, setEditedAfter] = useState<object | null>(null);
  const lookup = editedAfter === state ? undefined : state.lookup;
  const error = lookup?.kind === "error" ? lookup : null;
  const found = lookup?.kind === "found" ? lookup : null;
  const describedBy = error ? "team-error" : "team-hint";

  return (
    <form action={action} className="link-form">
      <label htmlFor="team">{LINK.field}</label>
      <input
        id="team"
        name="team"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        required
        defaultValue={state.input}
        onChange={() => setEditedAfter(state)}
        aria-describedby={describedBy}
        aria-invalid={error && !error.warning ? true : undefined}
      />
      {error ? (
        <p
          id="team-error"
          role="alert"
          className={error.warning ? "warning small" : "error small"}
        >
          {error.message}
        </p>
      ) : (
        <p id="team-hint" className="muted small">
          {LINK.hint}
        </p>
      )}
      {found ? (
        <div className="confirm-card">
          <div>
            <p className="label">{LINK.question}</p>
            <p className="confirm-name team-name">{found.name}</p>
            <p className="muted small">{found.summary}</p>
          </div>
          <div className="confirm-actions">
            <button
              type="submit"
              name="intent"
              value="reject"
              className="button secondary"
            >
              {LINK.reject}
            </button>
            <button type="submit" formAction={linkTeam} className="button">
              {LINK.confirm}
            </button>
          </div>
        </div>
      ) : (
        <button type="submit" className="button" disabled={pending}>
          {pending ? LINK.finding : LINK.find}
        </button>
      )}
    </form>
  );
}
