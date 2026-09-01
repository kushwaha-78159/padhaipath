import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

function readAnswer(content: unknown) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((part) => typeof part === "string" ? part : (part as { text?: string }).text ?? "").join("");
  return "I’m ready to help, but I couldn’t form an answer this time. Please try again.";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  study: router({
    askDoubt: publicProcedure
      .input(z.object({ question: z.string().trim().min(2).max(2000), context: z.string().max(1000).optional() }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are PadhaiPath, a patient academic study companion. Answer at the student’s level using clear headings, short paragraphs, and numbered step-by-step reasoning. Explain the why, not only the answer. If the question is ambiguous, state your assumption. End with one brief memory tip or check-for-understanding question. Do not pretend to know missing information." },
            { role: "user", content: `${input.context ?? "The student wants an approachable explanation."}\n\nQuestion:\n${input.question}` },
          ],
        });
        const answer = readAnswer(response.choices?.[0]?.message?.content);
        return { answer };
      }),
  }),
});

export type AppRouter = typeof appRouter;
