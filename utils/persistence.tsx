export function exportJSON<T>(fileName: string, data: T) {
  const json = JSON.stringify(data);
  const href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));

  const link = document.createElement('a');
  link.href = href;
  link.download = `${fileName}.json`;
  link.click();
  link.remove();

  URL.revokeObjectURL(href);
}

export async function importJSON(file: File): Promise<any> {
  return file.text().then((blob: string) => JSON.parse(blob));
}

export function saveToStorage<T>(key: string, data: T) {
  const blob = JSON.stringify(data);
  localStorage.setItem(key, blob);
}

export function loadFromStorage(key: string) {
  const blob = localStorage.getItem(key);
  return blob === null ? null : JSON.parse(blob);
}
