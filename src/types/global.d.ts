// Global type definitions for GENESIS platform

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, callback: (arg: unknown) => void) => void
      removeListener: (event: string, callback: (arg: unknown) => void) => void
    }
    GENESIS_LANDING?: boolean
  }
}

export {}
