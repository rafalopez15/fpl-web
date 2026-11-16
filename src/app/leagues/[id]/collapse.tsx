"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ChevronDown } from "./icons";

type Collapse = {
  isOpen: (entry: number) => boolean;
  toggle: (entry: number) => void;
  allClosed: boolean;
  toggleAll: () => void;
};

const CollapseContext = createContext<Collapse | null>(null);

function useCollapse(): Collapse {
  const collapse = useContext(CollapseContext);
  if (!collapse) throw new Error("Collapse controls need a CollapseProvider");
  return collapse;
}

// Which cards are collapsed. Cards start expanded, so the page reads fully before
// JavaScript loads; entries are the cards that have transfers to hide.
export function CollapseProvider({
  entries,
  children,
}: {
  entries: number[];
  children: ReactNode;
}) {
  const [closed, setClosed] = useState<ReadonlySet<number>>(new Set());
  const allClosed = entries.length > 0 && entries.every((e) => closed.has(e));

  const value: Collapse = {
    isOpen: (entry) => !closed.has(entry),
    toggle: (entry) =>
      setClosed((current) => {
        const next = new Set(current);
        if (next.has(entry)) next.delete(entry);
        else next.add(entry);
        return next;
      }),
    allClosed,
    toggleAll: () => setClosed(allClosed ? new Set() : new Set(entries)),
  };
  return (
    <CollapseContext.Provider value={value}>
      {children}
    </CollapseContext.Provider>
  );
}

export function CollapseAllButton() {
  const { allClosed, toggleAll } = useCollapse();
  return (
    <button type="button" className="text-button" onClick={toggleAll}>
      {allClosed ? "Expand all" : "Collapse all"}
    </button>
  );
}

export function CardToggle({
  entry,
  teamName,
  controls,
}: {
  entry: number;
  teamName: string;
  controls: string;
}) {
  const { isOpen, toggle } = useCollapse();
  const open = isOpen(entry);
  return (
    <button
      type="button"
      className="icon-button card-toggle"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={`${open ? "Hide" : "Show"} ${teamName}’s transfers`}
      onClick={() => toggle(entry)}
    >
      <ChevronDown />
    </button>
  );
}

// The card's transfer list, rendered on the server and hidden here when collapsed.
export function Collapsible({
  entry,
  id,
  children,
}: {
  entry: number;
  id: string;
  children: ReactNode;
}) {
  const { isOpen } = useCollapse();
  return (
    <div id={id} hidden={!isOpen(entry)}>
      {children}
    </div>
  );
}
