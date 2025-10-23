import type { Database } from '~/types/database.types'
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskRow = Database['public']['Tables']['tasks']['Row']

export const useTasks = () => {
  const supabase = useSupabaseClient<Database>()
  const { profile, fetchProfile } = useUserProfile()
  const tasks = ref<TaskRow[]>([])

  const ensureUserProfile = async () => {
    if (!profile.value) await fetchProfile()
    return profile.value
  }

  const addTask = async (
    title: string,
    description?: string,
    startdate?: string,
    enddate?: string,
    deadline?: string
  ) => {
    const userProfile = await ensureUserProfile()
    if (!userProfile) {
      console.error('[useTasks] No user profile found before insert')
      throw new Error('No user profile found')
    }

    const newTask: TaskInsert = {
      title,
      description,
      startdate,
      enddate,
      deadline,
      profile_id: userProfile.id,
    }

    try {
      console.debug('[useTasks] inserting task', newTask)
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask] as TaskInsert[])
        .select()

      if (error) {
        console.error('[useTasks] supabase insert error', error)
        throw error
      }

      const inserted = data?.[0]
      if (inserted) {
        tasks.value.unshift(inserted)
        console.debug('[useTasks] inserted', inserted)
      } else {
        console.warn('[useTasks] insert returned no data')
      }

      return inserted
    } catch (err) {
      console.error('[useTasks] addTask failed', err)
      throw err
    }
  }

  return { tasks, addTask }
}
