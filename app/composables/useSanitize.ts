import DOMPurify from "dompurify"

export function useSanitize() {
  // Sanitize a single string safely
  const sanitizeString = (input?: string | null): string | null => {
    if (process.server) return input?.trim() ?? "" // SSR safe: don't use DOMPurify on server
    if (!input) return "";
    const clean = DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    return clean || ""
  }

  // Sanitize an entire task object deeply
  const sanitizeTask = (task: {
    title?: string | null
    description?: string | null
    subtasks?: { title: string | null }[]
  }) => ({
    ...task,
    title: sanitizeString(task.title),
    description: sanitizeString(task.description),
    subtasks: task.subtasks?.map((st) => ({
      title: sanitizeString(st.title),
    })) ?? [],
  })

  return { sanitizeString, sanitizeTask }
}
