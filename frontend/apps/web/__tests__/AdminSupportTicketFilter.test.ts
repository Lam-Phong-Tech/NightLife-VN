import { describe, expect, it } from "vitest";
import {
  filterAdminSupportTickets,
  isWaitingForAdminReply,
} from "@/components/support-chat/admin-support-ticket-filter";

describe("admin support ticket filters", () => {
  const waitingTicket = {
    id: "waiting",
    status: "ACTIVE",
    messages: [{ senderType: "GUEST" }],
  };
  const answeredTicket = {
    id: "answered",
    status: "ACTIVE",
    messages: [{ senderType: "ADMIN" }],
  };

  it("treats the latest customer message as waiting even after the ticket is claimed", () => {
    expect(isWaitingForAdminReply(waitingTicket)).toBe(true);
  });

  it("ignores system messages when determining whether a customer is waiting", () => {
    expect(
      isWaitingForAdminReply({
        status: "ACTIVE",
        messages: [{ senderType: "SYSTEM" }, { senderType: "USER" }],
      }),
    ).toBe(true);
  });

  it("removes an answered ticket from the waiting filter", () => {
    expect(filterAdminSupportTickets([waitingTicket, answeredTicket], "waiting")).toEqual([
      waitingTicket,
    ]);
  });

  it("shows waiting and answered tickets in the all filter", () => {
    expect(filterAdminSupportTickets([waitingTicket, answeredTicket], "all")).toEqual([
      waitingTicket,
      answeredTicket,
    ]);
  });
});
