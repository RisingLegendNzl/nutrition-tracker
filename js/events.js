// Tiny pub/sub for Nutrify.
// Usage:
//   import bus, { on, off, emit } from './events.js'
//   const unsub = on('EVENT', (detail) => { ... })
//   emit('EVENT', { ... })
//   off('EVENT', handler) or call unsub()

const _map = new Map(); // eventName -> Set<handler>

export function on(eventName, handler) {
  if (!_map.has(eventName)) _map.set(eventName, new Set());
  _map.get(eventName).add(handler);
  // return unsubscribe for ergonomics
  return () => off(eventName, handler);
}

export function off(eventName, handler) {
  const set = _map.get(eventName);
  if (!set) return;
  set.delete(handler);
  if (set.size === 0) _map.delete(eventName);
}

export function emit(eventName, detail) {
  const set = _map.get(eventName);
  if (!set) return;
  // Call handlers safely; never throw across the bus
  for (const fn of Array.from(set)) {
    try { fn(detail); } catch (err) { console.error('Event handler error', { eventName, err }); }
  }
}

const bus = { on, off, emit };
export default bus;