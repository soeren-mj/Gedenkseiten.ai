'use client'

import { useState, useEffect, useCallback } from 'react'
import ChecklistItem from './ChecklistItem'

interface ToDoItem {
  id: string
  title: string
  description: string
  badge?: string
  href: string
  isCompleted: boolean
}

interface ToDoCardProps {
  userName?: string | null
  userAvatarUrl?: string | null
  className?: string
}

const STORAGE_KEY = 'dashboard_todo_visits'
const MAX_VISITS_AFTER_DONE = 3

// Check if theme was manually changed
function hasThemeBeenSet(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('theme') !== null
}

export default function ToDoCard({
  userName,
  userAvatarUrl,
  className = '',
}: ToDoCardProps) {
  const [todoVisits, setTodoVisits] = useState<Record<string, number>>({})
  const [mounted, setMounted] = useState(false)

  // Load visit counts from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setTodoVisits(JSON.parse(stored))
      } catch {
        setTodoVisits({})
      }
    }
  }, [])

  // Track page visits for completed items
  useEffect(() => {
    if (!mounted) return

    const updateVisits = () => {
      const stored = localStorage.getItem(STORAGE_KEY)
      const current: Record<string, number> = stored ? JSON.parse(stored) : {}

      // Increment visit count for completed items
      const todos = getTodoItems()
      let changed = false

      todos.forEach((todo) => {
        if (todo.isCompleted) {
          // Item is done - increment visit counter
          if (current[todo.id] === undefined) {
            current[todo.id] = 1
            changed = true
          } else if (current[todo.id] < MAX_VISITS_AFTER_DONE) {
            current[todo.id] += 1
            changed = true
          }
        } else {
          // Item is not done - reset counter if it was set
          if (current[todo.id] !== undefined && current[todo.id] !== 0) {
            current[todo.id] = 0
            changed = true
          }
        }
      })

      if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
        setTodoVisits(current)
      }
    }

    // Run on mount after a short delay to ensure state is settled
    const timeout = setTimeout(updateVisits, 100)
    return () => clearTimeout(timeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, userName, userAvatarUrl])

  // Define todo items with their completion conditions
  const getTodoItems = useCallback((): ToDoItem[] => {
    const themeSet = typeof window !== 'undefined' ? hasThemeBeenSet() : false

    return [
      {
        id: 'name',
        title: 'Wie sollen wir dich nennen?',
        description: 'Lege fest wie wir und deine Angehörigen dich nennen sollen',
        badge: 'Empfehlung',
        href: '/dashboard/settings',
        isCompleted: !!userName && userName.trim().length > 0,
      },
      {
        id: 'avatar',
        title: 'Wie soll dein Avatar dargestellt werden?',
        description: 'Lege dein Profilbild fest, damit dich deine Angehörigen wieder erkennen',
        badge: 'Empfehlung',
        href: '/dashboard/settings',
        isCompleted: !!userAvatarUrl,
      },
      {
        id: 'theme',
        title: 'Wähle deinen bevorzugten Look',
        description: 'Willst du lieber eine helle oder dunkle Optik wählen?',
        href: '/dashboard/settings',
        isCompleted: themeSet,
      },
    ]
  }, [userName, userAvatarUrl])

  // Filter out items that have been shown enough times after completion
  const getVisibleItems = useCallback((): ToDoItem[] => {
    if (!mounted) return []

    const todos = getTodoItems()
    return todos.filter((todo) => {
      const visits = todoVisits[todo.id] || 0
      // Show if: not completed OR completed but not shown 3 times yet
      return !todo.isCompleted || visits < MAX_VISITS_AFTER_DONE
    })
  }, [mounted, getTodoItems, todoVisits])

  const visibleItems = getVisibleItems()
  const openItemsCount = visibleItems.filter((item) => !item.isCompleted).length

  // Don't render if no items to show
  if (!mounted || visibleItems.length === 0) {
    return null
  }

  return (
    <div className={`p-4 bg-bw border border-main rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Counter */}
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
          <span className="text-webapp-subsection font-medium text-white">
            {openItemsCount}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-body-l font-medium text-primary">
            Persönliche Nachrichten
          </h3>
          <p className="text-body-s text-secondary">
            Du kannst noch Einstellungen erkunden.
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-1">
        {visibleItems.map((item) => (
          <ChecklistItem
            key={item.id}
            title={item.title}
            description={item.description}
            badge={item.badge}
            href={item.href}
            checked={item.isCompleted}
          />
        ))}
      </div>
    </div>
  )
}
