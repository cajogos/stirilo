// Shared between the edge middleware and server code. Keep this module free of
// Node-only imports so it can be used from the middleware (edge) runtime.

export const SESSION_COOKIE = "stirilo_session";

// Routes that are reachable without an authenticated session.
export const PUBLIC_ROUTES = ["/login"];
