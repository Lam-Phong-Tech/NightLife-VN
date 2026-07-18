import { describe, expect, it } from "vitest";
import {
  confirmOptimisticSupportMessage,
  mergeSupportChatHistory,
  type ChatMessage,
} from "@/components/layout/support-chat-state";

function message(id: string, text = id): ChatMessage {
  return {
    id,
    from: id.startsWith("system") ? "support" : "user",
    text,
    time: "14:05",
  };
}

describe("support chat message state", () => {
  it("keeps the first optimistic message when a stale empty history response arrives", () => {
    const optimisticMessage = message("temp-first", "Xin chào");

    expect(mergeSupportChatHistory([optimisticMessage], [])).toEqual([optimisticMessage]);
  });

  it("merges persisted history without removing a live offline notice", () => {
    const persistedMessage = message("message-first", "Xin chào");
    const offlineNotice = message("system-first", "Tin nhắn đã được ghi nhận.");

    expect(mergeSupportChatHistory([persistedMessage, offlineNotice], [persistedMessage])).toEqual([
      persistedMessage,
      offlineNotice,
    ]);
  });

  it("removes the optimistic copy when history already contains the persisted message", () => {
    const persistedMessage = message("message-first", "Xin chào");
    const optimisticMessage = message("temp-first", "Xin chào");

    expect(
      confirmOptimisticSupportMessage(
        [persistedMessage, optimisticMessage],
        optimisticMessage.id,
        persistedMessage.id,
      ),
    ).toEqual([persistedMessage]);
  });
});
