import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const body = await readBody<{ title: string; description?: string }>(event);
  const taskTitle = body.title;
  const taskDescription = body.description;

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

Consider:
- How complex is this task?
- What are the natural, logical steps someone would take?

Return the steps that genuinely help someone complete this task. If it's already simple and clear, return just 1-2 steps.`,
  });

  return result.object.subtasks;
});
