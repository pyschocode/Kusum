// src/logEvent.ts
export function logEvent(
  name: string,
  data: Record<string, unknown> = {}
) {
  // Simple frontend-only logger for now
  console.log('EVENT', {
    name,
    ...data,
    ts: Date.now(),
  });
}
