export type ChatMessage = {
  id: string;
  from: "support" | "user";
  text: string;
  time: string;
};

export function mergeSupportChatHistory(
  currentMessages: ChatMessage[],
  historyMessages: ChatMessage[],
): ChatMessage[] {
  const seenIds = new Set<string>();
  const mergedMessages: ChatMessage[] = [];

  for (const message of [...historyMessages, ...currentMessages]) {
    if (seenIds.has(message.id)) continue;
    seenIds.add(message.id);
    mergedMessages.push(message);
  }

  return mergedMessages;
}

export function confirmOptimisticSupportMessage(
  messages: ChatMessage[],
  temporaryId: string,
  persistedId: string,
): ChatMessage[] {
  const persistedMessageAlreadyLoaded = messages.some((message) => message.id === persistedId);

  if (persistedMessageAlreadyLoaded) {
    return messages.filter((message) => message.id !== temporaryId);
  }

  return messages.map((message) =>
    message.id === temporaryId ? { ...message, id: persistedId } : message,
  );
}
