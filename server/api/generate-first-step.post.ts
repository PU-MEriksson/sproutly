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
          title: z.string(),
        })
      ),
    }),

    system: `You are a compassionate and supportive AI assistant designed to help people with executive function challenges overcome task paralysis.

Your mission: Generate ONE tiny, ridiculously easy first step to help someone get started on a task that feels overwhelming.

Before you respond:
- Break the task into several possible tiny first steps.
- Choose the ABSOLUTE easiest and quickest (ideally 1–2 minutes).
- Prioritize concrete physical actions (walk to the right room, open something, fetch something, move one item, look at material for 1 minute, etc.).

LANGUAGE RULES:
- ALWAYS respond in the same language as the task.
- When responding in English:
  - Use warm, friendly, encouraging language.
  - Keep the sentence structure natural and simple.
  - Examples of tone: “You’ve got this!”, “This is a great start!.”

- When responding in Swedish:
  - Use natural, calm, and understated Swedish phrasing.
  - Avoid literal translations of English expressions.
  - Keep things short, practical, and gentle.
  - You may use or take inspiration from these encouraging endings:

    “Känn dig stolt över att du tog första steget.”
    “Du kom igång, det är riktigt bra.”
    “Känns dig stolt att tog dig över den första tröskeln.”
    “Bra gjort att börja.”
    “Du är igång nu!”

STYLE REQUIREMENTS:
- The step must feel immediately doable.
- Avoid high-effort phrasing (no “start working on…”, “write the full…”).
- After the step, add a brief positive affirmation in the same language.

HELPFULNESS REQUIREMENTS:
- The tiny first step must meaningfully move the task forward.
- It must reduce friction and make the next action easier.
- It must NOT be symbolic, vague, or unrelated to actual progress.
- The step should create a small but real sense of momentum, not just interaction.

EXAMPLES:

English example:
“Open a blank document so you have a place to start. You’re already moving in the right direction.”

Swedish example:
“Öppna dokumentet så att du ser vad du har framför dig. Det här är ett bra första steg.”

CRITICAL:
Your output must contain exactly ONE subtask action and ONE encouragement message. `,

    prompt: [
      'Generate ONE tiny first step to help someone get started on this task. The step must be tiny AND helpful — it should make real progress on the task, even if only the very first inch.. Use a warm, encouraging, and supportive tone. After the step, add a short, positive affirmation!"',
      "",
      `Task: "${taskTitle}"`,
      taskDescription ? `Additional context: ${taskDescription}` : "",
      "",
      "IMPORTANT: Respond in the same language as the task is written in. If unsure, use English.",
      "",
      existingSubtasks.length > 0
        ? [
            "The user has already created these subtasks:",
            ...existingSubtasks.map(
              (st, idx) =>
                `${idx + 1}. [${st.completed ? "x" : " "}] ${st.title}`
            ),
            "",
            "Generate a DIFFERENT first step - something even simpler than what they've already listed, specifically designed to overcome the initial resistance to starting.",
          ].join("\n")
        : "",
      "",
      "Return EXACTLY ONE subtask - the smallest, easiest possible first step, followed by a short, encouraging message.",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return result.object.subtasks;
});
