// Build-time feature flags. Read from `import.meta.env` so unused features are
// dead-code-eliminated in production builds where the flag is unset.

/**
 * Edge / WAF UI (rules, custom hostnames, rate limits). Consumes the
 * EDGE-01 / EDGE-02 API shape. Off by default; enable with `VITE_EDGE_UI=true`.
 */
export const EDGE_UI_ENABLED: boolean = import.meta.env.VITE_EDGE_UI === 'true'
