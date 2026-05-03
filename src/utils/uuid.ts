export function generateId(): string {
  // Lightweight UUID-like generator (not RFC4122 but good enough for local IDs)
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9)
}
