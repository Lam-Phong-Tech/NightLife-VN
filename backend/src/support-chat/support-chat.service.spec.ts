import { SupportSenderType, SupportTicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupportChatService } from './support-chat.service';

describe('SupportChatService', () => {
  const supportTicket = {
    findMany: jest.fn(),
    updateMany: jest.fn(),
    findUnique: jest.fn(),
  };
  const supportMessage = {
    create: jest.fn(),
  };
  const prisma = {
    supportTicket,
    supportMessage,
  } as unknown as PrismaService;

  let service: SupportChatService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SupportChatService(prisma);
  });

  it('attaches a pending guest ticket to the user who has just logged in', async () => {
    const mergedTicket = {
      id: 'ticket-1',
      status: SupportTicketStatus.PENDING,
      guestSessionId: null,
      userId: 'user-1',
      user: {
        id: 'user-1',
        displayName: 'Quang Duc',
        email: 'quang@example.com',
      },
    };
    const systemMessage = {
      id: 'message-1',
      ticketId: 'ticket-1',
      senderType: SupportSenderType.SYSTEM,
      content: 'Khách hàng đã đăng nhập tài khoản.',
    };

    supportTicket.findMany.mockResolvedValue([
      { id: 'ticket-1', status: SupportTicketStatus.PENDING },
    ]);
    supportTicket.updateMany.mockResolvedValue({ count: 1 });
    supportTicket.findUnique.mockResolvedValue(mergedTicket);
    supportMessage.create.mockResolvedValue(systemMessage);

    await expect(
      service.mergeSession('guest-session-1', 'user-1'),
    ).resolves.toEqual({
      ticket: mergedTicket,
      message: systemMessage,
    });

    expect(supportTicket.updateMany).toHaveBeenCalledWith({
      where: { guestSessionId: 'guest-session-1' },
      data: {
        userId: 'user-1',
        guestSessionId: null,
      },
    });
    expect(supportTicket.findUnique).toHaveBeenCalledWith({
      where: { id: 'ticket-1' },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
      },
    });
    expect(supportMessage.create).toHaveBeenCalledWith({
      data: {
        ticketId: 'ticket-1',
        senderType: SupportSenderType.SYSTEM,
        content: 'Khách hàng đã đăng nhập tài khoản.',
      },
    });
  });

  it('does nothing when the guest session has already been merged', async () => {
    supportTicket.findMany.mockResolvedValue([]);

    await expect(
      service.mergeSession('guest-session-1', 'user-1'),
    ).resolves.toBeNull();

    expect(supportTicket.updateMany).not.toHaveBeenCalled();
    expect(supportMessage.create).not.toHaveBeenCalled();
  });
});
