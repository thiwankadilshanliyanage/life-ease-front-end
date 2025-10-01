// src/utils/loadingBus.js
let count = 0;
const listeners = new Set();

const notify = () => {
  for (const cb of listeners) cb(count);
};

export const inc = () => {
  count += 1;
  notify();
};

export const dec = () => {
  count = Math.max(0, count - 1);
  notify();
};

export const subscribe = (cb) => {
  listeners.add(cb);
  // push current value immediately
  cb(count);
  return () => listeners.delete(cb);
};

export const getCount = () => count;
