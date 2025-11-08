/**
 * Utility functions for managing pending email change state in localStorage
 * Implements 24-hour timeout for pending email change notifications
 */

const STORAGE_KEY = 'pending_email_change'
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

export interface PendingEmailChange {
  newEmail: string
  timestamp: number
}

/**
 * Save a pending email change to localStorage
 * @param newEmail - The new email address that is pending confirmation
 */
export function savePendingEmailChange(newEmail: string): void {
  if (typeof window === 'undefined') return

  const pendingChange: PendingEmailChange = {
    newEmail,
    timestamp: Date.now(),
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingChange))
  } catch (error) {
    console.error('Failed to save pending email change to localStorage:', error)
  }
}

/**
 * Get pending email change from localStorage
 * Automatically removes the entry if it's older than 24 hours
 * @returns PendingEmailChange object if valid and not expired, null otherwise
 */
export function getPendingEmailChange(): PendingEmailChange | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const pendingChange: PendingEmailChange = JSON.parse(stored)

    // Check if the pending change has expired (older than 24 hours)
    const isExpired = Date.now() - pendingChange.timestamp > TWENTY_FOUR_HOURS_MS

    if (isExpired) {
      // Auto-cleanup expired entries
      removePendingEmailChange()
      return null
    }

    return pendingChange
  } catch (error) {
    console.error('Failed to get pending email change from localStorage:', error)
    // Clean up corrupted data
    removePendingEmailChange()
    return null
  }
}

/**
 * Remove pending email change from localStorage
 * Call this when the email change is confirmed or cancelled
 */
export function removePendingEmailChange(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to remove pending email change from localStorage:', error)
  }
}

/**
 * Check if a pending email change exists and is still valid
 * @returns true if there's a valid pending email change, false otherwise
 */
export function hasPendingEmailChange(): boolean {
  return getPendingEmailChange() !== null
}
