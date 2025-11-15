import { ref, watch, type Ref } from "vue"
import { parseDate, type DateValue } from "@internationalized/date"
import { formatDateValueToYmd } from "@/utils/dates"

export function useDateField(
  form: any,
  name: string,
  initial: Ref<string | undefined>
) {
  // Initialize the DateValue from the initial ref
  const value = ref<any>(initial.value ? parseDate(initial.value) : undefined)

  // Watch for parent prop changes (reactive)
  watch(initial, (newVal) => {
    value.value = newVal ? parseDate(newVal) : undefined
  })

  // Sync calendar value back to the form
  watch(value, (v) => {
    form.setFieldValue(name, v ? formatDateValueToYmd(v) : undefined)
  })

  return value
}
