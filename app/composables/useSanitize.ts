import DOMPurify from "dompurify"

export function useSanitize() {
  const sanitizeString = (input?: string | null): string | null => {
    if (process.server) return input?.trim() ?? ""
    if (!input) return ""
    const clean = DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    return clean || ""
  }

  const sanitizeTask = (task: {
    title?: string | null
    description?: string | null
    subtasks?: { title: string | null }[]
  }) => {
    const sanitized: any = { ...task }

    if (task.title !== undefined)
      sanitized.title = sanitizeString(task.title)

    if (task.description !== undefined)
      sanitized.description = sanitizeString(task.description)

    if (task.subtasks !== undefined)
      sanitized.subtasks = task.subtasks.map(st => ({
        title: sanitizeString(st.title),
      }))

    return sanitized
  }

  return { sanitizeString, sanitizeTask }
}
