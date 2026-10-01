import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { createPageVisit, trackEvent, type PageVisit } from "./tracking";

const VisitContext = createContext<PageVisit | undefined>(undefined);

function useRouteVisit(): PageVisit {
  const { pathname } = useLocation();
  const [visit, setVisit] = useState(() => createPageVisit(pathname));
  if (visit.pathname !== pathname) {
    const next = createPageVisit(pathname);
    setVisit(next);
    return next;
  }
  return visit;
}

export function useAnalyticsVisit(): PageVisit {
  const shared = useContext(VisitContext);
  const fallback = useRouteVisit();
  return shared ?? fallback;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const visit = useRouteVisit();
  const recorded = useRef<string | undefined>(undefined);
  useLayoutEffect(() => {
    if (recorded.current === visit.id) return;
    recorded.current = visit.id;
    trackEvent("page_view", visit);
  }, [visit]);
  return <VisitContext.Provider value={visit}>{children}</VisitContext.Provider>;
}
