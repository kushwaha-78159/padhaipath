import { beforeEach, describe, expect, it, vi } from "vitest";

const { invokeLLM } = vi.hoisted(() => ({ invokeLLM: vi.fn() }));
vi.mock("./_core/llm", () => ({ invokeLLM }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx = { user: undefined, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] } as TrpcContext;

describe("study.askDoubt", () => {
  beforeEach(() => invokeLLM.mockReset());

  it("returns the model's structured text answer", async () => {
    invokeLLM.mockResolvedValue({ choices: [{ message: { content: "## Solution\n\n1. Start with the definition.\n2. Apply it carefully." } }] });
    const result = await appRouter.createCaller(ctx).study.askDoubt({ question: "How do I begin?" });
    expect(result.answer).toContain("Start with the definition");
    expect(invokeLLM).toHaveBeenCalledOnce();
  });

  it("handles an unavailable model response without exposing implementation details", async () => {
    invokeLLM.mockResolvedValue({ choices: [] });
    const result = await appRouter.createCaller(ctx).study.askDoubt({ question: "Explain photosynthesis" });
    expect(result.answer).toContain("couldn’t form an answer");
    expect(result.answer).not.toContain("API");
  });
});
