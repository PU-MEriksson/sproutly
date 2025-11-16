import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";

export const subtaskSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1),
  completed: z.boolean().default(false),
});

export const taskSchema = toTypedSchema(
  z.object({
    title: z.string().min(1, "Task title is required").max(100, "Max 100 characters allowed"),
    description: z.string().max(500, "Max 500 characters allowed").optional(),
    startdate: z.string().date().optional(),
    enddate: z.string().date().optional(),
    deadline: z.string().date().optional(),
    subtasks: z.array(subtaskSchema).default([]),
  })
);