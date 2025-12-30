import { dev } from "$app/environment";
import { injectAnalytics } from "@vercel/analytics/sveltekit";
import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";

export const load = () => {
  injectAnalytics({ mode: dev ? "development" : "production" });
  injectSpeedInsights();
};
