export const STORAGE_KEY = 'attendance-tracker-v1'

export interface StorageAdapter {
  load: <T>() => T | null
  save: <T>(data: T) => void
  clear: () => void
}

export const localStorageAdapter: StorageAdapter = {
  load<T>(): T | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
  save<T>(data: T): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },
}
