// Helper to decode username from JWT
export function getUsernameFromToken(token: string): string {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return decoded.username || "Operator";
  } catch {
    return "Operator";
  }
}
