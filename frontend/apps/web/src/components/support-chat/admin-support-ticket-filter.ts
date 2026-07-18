export type AdminSupportTicketFilter = "waiting" | "all";

type FilterableSupportTicket = {
  status?: string;
  messages?: Array<{
    senderType?: string;
  }>;
};

export function isWaitingForAdminReply(ticket: FilterableSupportTicket): boolean {
  const latestConversationMessage = ticket.messages?.find(
    (message) => message.senderType !== "SYSTEM",
  );

  if (!latestConversationMessage) {
    return ticket.status === "PENDING";
  }

  return (
    latestConversationMessage.senderType === "GUEST" ||
    latestConversationMessage.senderType === "USER"
  );
}

export function filterAdminSupportTickets<T extends FilterableSupportTicket>(
  tickets: T[],
  filter: AdminSupportTicketFilter,
): T[] {
  if (filter === "all") return tickets;
  return tickets.filter(isWaitingForAdminReply);
}
