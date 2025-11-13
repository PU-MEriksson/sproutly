import { toast } from "vue-sonner"

export function useAppToast() {
  const success = (title: string, description?: string) => {
    toast.success(title, { description })
  }

  const error = (title: string, description?: string) => {
    toast.error(title, { description })
  }

  const info = (title: string, description?: string) => {
    toast(title, { description })
  }

  const promise = async <T>(
    promise: Promise<T>,
    {
      loading = "Working...",
      success = "Done!",
      error = "Something went wrong.",
    }: {
      loading?: string
      success?: string
      error?: string
    } = {}
  ) => {
    toast.loading(loading)
    try {
      const result = await promise
      toast.success(success)
      return result
    } catch (err) {
      console.error(err)
      toast.error(error)
      throw err
    }
  }

  return { success, error, info, promise }
}
