import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'


const fetchTasks = () => {
  const tasks = axios.get('/api/tasks')
  console.log(tasks)
  return tasks
}

const deleteTask = async (taskId: string | undefined) => {
  const { data } = await axios.delete(`/api/tasks/${taskId}`)

  if (data.error) throw new Error(data.error)
  return data
}

export function useGetTasks () {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fetchTasks,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

export function useDeleteTask () {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}
