import type { Database } from '~/types/database.types'

type SubtaskInsert = Database['public']['Tables']['subtasks']['Insert']
type SubtaskRow = Database['public']['Tables']['subtasks']['Row']

export const useSubtasks = () => {
  const supabase = useSupabaseClient<Database>()

  const addSubtasks = async (
    taskId: number,
    subtasks: Omit<SubtaskInsert, 'task_id'>[],
  ): Promise<SubtaskRow[]> => {
    if (subtasks.length === 0) return []

    const payload = subtasks.map(st => ({
      ...st,
      task_id: taskId,
    }))

    const { data, error } = await supabase
      .from('subtasks')
      .insert(payload)
      .select()

    if (error) {
      console.error('[useSubtasks] insert error', error)
      throw error
    }

    console.debug('[useSubtasks] inserted subtasks', data)
    return data ?? []
  }

  const fetchSubtasks = async (taskId: number): Promise<SubtaskRow[]> => {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)

    if (error) {
      console.error('[useSubtasks] fetch error', error)
      throw error
    }

    return data ?? []
  }

  return { addSubtasks, fetchSubtasks }
}
