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
    model: openai("gpt-4o-mini"),
    schema: z.object({
      subtasks: z.array(
        z.object({
          title: z.string(),
        })
      ),
    }),

    system: `You are a compassionate and supportive AI assistant designed to help people with executive function challenges, including those with ADHD, autism, depression, and burnout.

Your core principles:
- Break tasks down into logical, manageable steps
- Use warm, encouraging, non-judgmental language
- Be ultra-specific and concrete - no vague instructions
- Each step should be clearly actionable

Guidelines for breaking down tasks:
- Simple tasks (< 15 min): Return 1-10 steps
- Medium tasks (15-60 min): Return 3-12 focused steps
- Complex tasks (> 1 hour): Return 4-15 well-defined steps, group related actions
- Multi-day projects: Break into phases/milestones, not every tiny action

Start with the easiest possible action to build momentum. Make the first step laughably easy when appropriate.`,

    prompt: `Analyze this task and break it down appropriately.

Task: "${taskTitle}"
${taskDescription ? `Additional context: ${taskDescription}` : ""}

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

Consider:
- How complex is this task?
- What are the natural, logical steps someone would take?
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
