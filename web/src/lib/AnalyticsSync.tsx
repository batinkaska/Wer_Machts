import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, logAnalyticsEvent } from "./analytics";

export function AnalyticsSync() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    logAnalyticsEvent("page_view", {
      page_path: location.pathname + location.search,
    });
  }, [location.pathname, location.search]);

  return null;
}
