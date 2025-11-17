import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

interface ExistingSubtask {
  title: string;
  completed: boolean;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const body = await readBody<{
    title: string;
    description?: string;
    existingSubtasks?: ExistingSubtask[];
  }>(event);

  const taskTitle = body.title;
  const taskDescription = body.description;
  const existingSubtasks = body.existingSubtasks || [];

  const openai = createOpenAI({
    apiKey: config.openaiApiKey,
  });

  const result = await generateObject({
    model: openai("gpt-5-mini"),
    schema: z.object({
      subtasks: z.array(
        z.object({
          title: z
            .string()
            .max(100)
            .describe("One clear, concise action step (max 100 characters)"),
        })
      ),
    }),

    system: `You are a compassionate and supportive AI assistant designed to help people with executive function challenges.

Your core principles:
- Break tasks into a few clear, meaningful steps
- Use warm, encouraging, non-judgmental language
- Be concrete and actionable, but not overly granular
- Each step should represent real progress, not tiny actions

Guidelines for breaking down tasks:
- Simple tasks (< 15 min): 2–5 steps max
- Medium tasks (15–60 min): 3–7 steps max
- Complex tasks (> 1 hour): 4–10 steps max
- Multi-day projects: 3–5 broader milestones
Never exceed 10 total subtasks.
Prefer fewer, impactful steps over excessive detail.
Start with the easiest possible action to build momentum.

CRITICAL: You MUST respond in the exact same language as the task. If the task is in Swedish, respond in Swedish. If in English, respond in English. If you cannot determine the language, default to English.`,

    prompt: `Analyze this task and break it down appropriately. 
    
    First, estimate the task's complexity (simple, medium, or complex). This should guide how many subtasks to create. Do not add the complexity as a subtask.
Then, generate an appropriate number of steps based on that.
Each subtask should represent a meaningful piece of progress. Do not add any encouragements or extra text—just the steps.

Task: "${taskTitle}"
${taskDescription ? `Additional context: ${taskDescription}` : ""}

IMPORTANT: Respond in the same langage as the task is written in. If unsure, use English.

${
  existingSubtasks.length > 0
    ? `
Existing subtasks already added by the user:
${existingSubtasks
  .map((st, idx) => `${idx + 1}. [${st.completed ? "x" : " "}] ${st.title}`)
  .join("\n")}

IMPORTANT: 
- Do NOT duplicate these existing subtasks
- Generate ONLY new, complementary steps that fill gaps or add value
- Consider what's already done (marked with [x])
- If the existing subtasks already cover everything well, return an empty array or just 1-2 additional helpful steps
`
    : ""
}

${
  existingSubtasks.length > 0
    ? "- What steps are missing from the existing subtasks?"
    : ""
}

Return ${
      existingSubtasks.length > 0
        ? "ONLY NEW steps that complement existing ones"
        : "the steps that genuinely help someone complete this task"
    }.`,
  });

  return result.object.subtasks;
});
