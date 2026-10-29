import { describe, expect, it } from "vitest";
import { openaiChatParams } from "@/lib/ai/openai-chat";

describe("openaiChatParams", () => {
  it("mantém temperature no gpt-4o-mini e usa max_completion_tokens", () => {
    expect(openaiChatParams("gpt-4o-mini", 1024)).toEqual({
      model: "gpt-4o-mini",
      max_completion_tokens: 1024,
      temperature: 0.7,
    });
  });

  it("não envia temperature para gpt-6-luna", () => {
    expect(openaiChatParams("gpt-6-luna", 400)).toEqual({
      model: "gpt-6-luna",
      max_completion_tokens: 400,
    });
  });
});
