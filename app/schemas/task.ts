import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";

export const subtaskSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1),
  completed: z.boolean().default(false),
});

export const taskSchema = toTypedSchema(
  z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    startdate: z.string().date().optional(),
    enddate: z.string().date().optional(),
    deadline: z.string().date().optional(),
    subtasks: z.array(subtaskSchema).default([]),
  })
);