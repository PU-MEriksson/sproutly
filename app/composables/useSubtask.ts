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

    const payload = sanitizedSubtasks.map((st) => ({
      ...st,
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

    console.debug("[useSubtasks] inserted subtasks", data);
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

    console.debug("[useSubtasks] updated subtask", data);
    return data;
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

    console.debug("[useSubtasks] deleted subtask", subtaskId);
  };

  const toggleSubtaskCompleted = async (
    subtaskId: number,
    completed: boolean
  ): Promise<SubtaskRow> => {
    return updateSubtask(subtaskId, { completed });
  };

  return {
    addSubtasks,
    fetchSubtasks,
    updateSubtask,
    deleteSubtask,
    toggleSubtaskCompleted,
  };
};
