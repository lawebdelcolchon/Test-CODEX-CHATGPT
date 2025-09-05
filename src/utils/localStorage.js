export const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
export const read = (k, def = null) => {
  try { return JSON.parse(localStorage.getItem(k)); } catch { return def; }
};
export const remove = (k) => localStorage.removeItem(k);
