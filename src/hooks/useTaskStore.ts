'use client'

import { useState, useEffect, useCallback } from 'react'
import { Task } from '@/types'
import { mockTasks } from '@/data/mockData'

const STORAGE_KEY = 'it-update-tasks'

function loadTasks(): Task[] {
  if (typeof window === 'undefined') return mockTasks
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return mockTasks
    return JSON.parse(raw) as Task[]
  } catch {
    return mockTasks
  }
}

function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {}
}

export function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setTasks(loadTasks())
    setHydrated(true)
  }, [])

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => {
      const next = [task, ...prev]
      saveTasks(next)
      return next
    })
  }, [])

  const updateTask = useCallback((updated: Task) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === updated.id ? updated : t))
      saveTasks(next)
      return next
    })
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id)
      saveTasks(next)
      return next
    })
  }, [])

  const resetToDefault = useCallback(() => {
    saveTasks(mockTasks)
    setTasks(mockTasks)
  }, [])

  return { tasks, hydrated, addTask, updateTask, deleteTask, resetToDefault }
}
