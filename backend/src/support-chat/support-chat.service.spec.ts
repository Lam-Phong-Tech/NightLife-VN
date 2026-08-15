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
    groupBy: jest.fn(),
    updateMany: jest.fn(),
  };
  const notificationLog = {
    create: jest.fn(),
  };
  const prisma = {
    supportTicket,
    supportMessage,
    notificationLog,
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

  it('creates an in-app notification when Admin replies to a signed-in customer', async () => {
    supportTicket.findUnique.mockResolvedValue({
      user: { id: 'member-1', email: 'member@example.com' },
    });
    notificationLog.create.mockResolvedValue({ id: 'notification-1' });

    await service.createMemberReplyNotification({
      ticketId: 'ticket-1',
      messageId: 'message-1',
      content: '  Admin đã phản hồi\nngay bây giờ.  ',
    });

    expect(notificationLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'member-1',
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: 'member@example.com',
        templateKey: 'customer.support.reply.v1',
        payload: {
          supportTicketId: 'ticket-1',
          messageId: 'message-1',
          preview: 'Admin đã phản hồi ngay bây giờ.',
        },
      },
    });
  });

  it('creates an admin notification when a customer sends a support message', async () => {
    supportTicket.findUnique.mockResolvedValue({
      user: { displayName: 'Khách Demo' },
    });
    notificationLog.create.mockResolvedValue({ id: 'notification-2' });

    await service.createAdminCustomerMessageNotification({
      ticketId: 'ticket-2',
      messageId: 'message-2',
      content: 'Xin Admin hỗ trợ giúp tôi.',
    });

    expect(notificationLog.create).toHaveBeenCalledWith({
      data: {
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: 'ADMIN',
        templateKey: 'admin.support.customer_message.v1',
        payload: {
          supportTicketId: 'ticket-2',
          messageId: 'message-2',
          customerName: 'Khách Demo',
          preview: 'Xin Admin hỗ trợ giúp tôi.',
        },
      },
    });
  });

  it('counts support tickets with unread customer messages for admin badge', async () => {
    supportMessage.groupBy.mockResolvedValue([
      { ticketId: 'ticket-1', _count: { ticketId: 2 } },
      { ticketId: 'ticket-2', _count: { ticketId: 1 } },
    ]);

    await expect(service.countUnreadAdminTickets()).resolves.toBe(2);

    expect(supportMessage.groupBy).toHaveBeenCalledWith({
      by: ['ticketId'],
      where: {
        isRead: false,
        senderType: {
          in: [SupportSenderType.GUEST, SupportSenderType.USER],
        },
        ticket: {
          status: {
            in: [SupportTicketStatus.PENDING, SupportTicketStatus.ACTIVE],
          },
        },
      },
      _count: { ticketId: true },
    });
  });

  it('marks unread customer messages as read when admin opens a ticket', async () => {
    supportMessage.updateMany.mockResolvedValue({ count: 3 });

    await expect(service.markTicketReadByAdmin('ticket-1')).resolves.toEqual({
      count: 3,
    });

    expect(supportMessage.updateMany).toHaveBeenCalledWith({
      where: {
        ticketId: 'ticket-1',
        isRead: false,
        senderType: {
          in: [SupportSenderType.GUEST, SupportSenderType.USER],
        },
      },
      data: { isRead: true },
    });
  });
});
