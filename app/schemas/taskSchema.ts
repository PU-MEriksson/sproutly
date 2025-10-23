import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'


const taskSchema = toTypedSchema(z.object({
  title: z.string(),
  description: z.string().optional(),
  startdate: z.string().datetime().optional(),
  endate: z.string().datetime().optional(),
  deadline: z.string().datetime().optional(),   
}))

