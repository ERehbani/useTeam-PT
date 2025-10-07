import { Task } from '@/app/entities/task/types'
import { create } from 'zustand'

interface Store {
  task: Task
  setTask: (task: Task) => void
}

export const useStore = create<Store>(set => {
  const task: Task = {
    title: '',
    description: '',
    columnId: '',
    responsability: [],
    position: 0
  }
  const setTask = (task: Task) => {
    set({ task })
  }

  return {
    task,
    setTask
  }
})
