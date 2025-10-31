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
- Break tasks into small, concrete, actionable micro-steps
- Use warm, encouraging, non-judgmental language
- Start with the easiest possible action to build momentum
- Be ultra-specific - no vague instructions
- Each step should take 5-15 minutes maximum
- Never overwhelm - less is more

You understand that starting is often the hardest part, so you make the first step laughably easy.`,

    // PROMPT: Den specifika uppgiften
    prompt: `Break down this task into small, manageable steps:

Task: "${taskTitle}"
${taskDescription ? `Additional context: ${taskDescription}` : ""}


Return steps in order from first to last.`,
  });

  console.log(JSON.stringify(result.object.subtasks, null, 2));

  return result.object.subtasks;
});
