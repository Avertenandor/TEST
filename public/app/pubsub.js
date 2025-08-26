const bus = new Map();

export function on(ev, fn) {
  if (!bus.has(ev)) bus.set(ev, new Set());
  bus.get(ev).add(fn);
}

export function off(ev, fn) {
  bus.get(ev)?.delete(fn);
}

export function emit(ev, payload) {
  bus.get(ev)?.forEach(fn => fn(payload));
}