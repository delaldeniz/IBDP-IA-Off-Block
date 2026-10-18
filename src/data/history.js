const KEY = "delaywatch_history";
export const MAX_ITEMS = 50;

export function loadHistory() {
  try {
    const items = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function saveHistory(items) {
  localStorage.setItem(KEY, JSON.stringify(items.slice(-MAX_ITEMS)));
}

export function addToHistory(input, probability) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  saveHistory([...loadHistory(), { id, ...input, probability, checked_at: new Date().toISOString() }]);
}
