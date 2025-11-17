import type { Database } from "~/types/database.types";
import { useSanitize } from "./useSanitize";

type SubtaskInsert = Database["public"]["Tables"]["subtasks"]["Insert"];
type SubtaskRow = Database["public"]["Tables"]["subtasks"]["Row"];

export const useSubtasks = () => {
  const { sanitizeString } = useSanitize()
  const supabase = useSupabaseClient<Database>();

  const addSubtasks = async (
    taskId: number,
    subtasks: Omit<SubtaskInsert, "task_id">[]
  ): Promise<SubtaskRow[]> => {
    if (subtasks.length === 0) return [];

    const sanitizedSubtasks = subtasks.map(st => ({
      ...st,
      title: sanitizeString(st.title) as string, // ensure string, not null
    }));

    const payload = sanitizedSubtasks.map(({ id, ...rest }) => ({
      ...rest,
      task_id: taskId,
    }));

    const { data, error } = await supabase
      .from("subtasks")
      .insert(payload)
      .select();

    if (error) {
      console.error("[useSubtasks] insert error", error);
      throw error;
    }
    return data ?? [];
  };

  const fetchSubtasks = async (taskId: number): Promise<SubtaskRow[]> => {
    const { data, error } = await supabase
      .from("subtasks")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[useSubtasks] fetch error", error);
      throw error;
    }

    return data ?? [];
  };

  const updateSubtask = async (
    subtaskId: number,
    updates: Partial<Omit<SubtaskRow, "id" | "created_at" | "task_id">>
  ): Promise<SubtaskRow> => {

    const sanitizedUpdates = {
    ...updates,
    title: updates.title !== undefined ? sanitizeString(updates.title) as string : undefined,
    };


    const { data, error } = await supabase
      .from("subtasks")
      .update(sanitizedUpdates)
      .eq("id", subtaskId)
      .select()
      .single();

    if (error) {
      console.error("[useSubtasks] update error", error);
      throw error;
    }
    return data;
  };

    const updateSubtasks = async (
    subtasks: { id: number; title?: string }[]
  ): Promise<SubtaskRow[]> => {
    const updated: SubtaskRow[] = [];
    for (const st of subtasks) {
      const data = await updateSubtask(st.id, { title: st.title });
      updated.push(data);
    }
    return updated;
  };

  const deleteSubtask = async (subtaskId: number): Promise<void> => {
    const { error } = await supabase
      .from("subtasks")
      .delete()
      .eq("id", subtaskId);

    if (error) {
      console.error("[useSubtasks] delete error", error);
      throw error;
    }
  };

    const deleteSubtasks = async (ids: number[]): Promise<void> => {
    if (ids.length === 0) return;
    const { error } = await supabase.from("subtasks").delete().in("id", ids);
    if (error) throw error;
  };

  const toggleSubtaskCompleted = async (
    subtaskId: number,
    completed: boolean
  ): Promise<SubtaskRow> => {
    return updateSubtask(subtaskId, { completed });
  };

  const syncSubtasks = async (
    taskId: number,
    original: Array<{ id?: number; title: string; completed?: boolean }>,
    current: Array<{ id?: number; title: string; completed?: boolean }>
  ): Promise<void> => {
    const origMap = new Map(original.filter(s => s.id).map(s => [s.id!, s]));
    const currMap = new Map(current.filter(s => s.id).map(s => [s.id!, s]));

    const toCreate = current.filter(s => !s.id);
    const toUpdate = current.filter(s => {
      if (!s.id) return false;
      const orig = origMap.get(s.id);
      return (
        s.title !== orig?.title ||
        s.completed !== orig?.completed // <- keep this
      );
    }) as { id: number; title: string; completed?: boolean }[];

    const toDelete = original
      .filter(s => s.id && !currMap.has(s.id))
      .map(s => s.id!) as number[];

    if (toCreate.length) await addSubtasks(taskId, toCreate);
    if (toUpdate.length) await updateSubtasks(toUpdate);
    if (toDelete.length) await deleteSubtasks(toDelete);
  };

  return {
    addSubtasks,
    fetchSubtasks,
    updateSubtask,
    updateSubtasks,
    deleteSubtask,
    deleteSubtasks,
    toggleSubtaskCompleted,
    syncSubtasks
  };
};
