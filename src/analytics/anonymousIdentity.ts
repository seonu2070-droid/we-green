const STORAGE_KEY = "wegreen:anonymous-device-id";
const ANONYMOUS_ID = /^wg_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
let memoryId: string | undefined;

// Own identity namespace: never read URL identifiers or the SDK's identity store.
export function anonymousDeviceId(): string {
  if (memoryId) return memoryId;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ANONYMOUS_ID.test(stored)) return (memoryId = stored);
  } catch { /* A blocked store still gets a stable identity for this page. */ }
  memoryId = `wg_${crypto.randomUUID()}`;
  try { localStorage.setItem(STORAGE_KEY, memoryId); }
  catch { /* Keep the generated in-memory identity; refresh persistence is unavailable. */ }
  return memoryId;
}
