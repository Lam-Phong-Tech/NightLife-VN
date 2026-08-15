import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupportSenderType, SupportTicketStatus } from '@prisma/client';

@Injectable()
export class SupportChatService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly openTicketStatuses: SupportTicketStatus[] = [
    SupportTicketStatus.PENDING,
    SupportTicketStatus.ACTIVE,
  ];

  async getHistory(ticketId: string, limit = 50, beforeMessageId?: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const query: any = {
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        senderUser: {
          select: {
            id: true,
            displayName: true,
            profile: { select: { avatar: true } },
          },
        },
      },
    };

    if (beforeMessageId) {
      query.cursor = { id: beforeMessageId };
      query.skip = 1;
    }

    const messages = await this.prisma.supportMessage.findMany(query);
    // Reverse because we queried desc to get the latest, but chat UI needs chronological
    return messages.reverse();
  }

  async getSessionHistory(
    guestSessionId?: string,
    userId?: string,
    limit = 50,
    beforeMessageId?: string,
  ) {
    const ticket = await this.findLatestOpenTicket(guestSessionId, userId);
    if (!ticket) return { ticket: null, messages: [] };

    const messages = await this.getHistory(ticket.id, limit, beforeMessageId);
    return { ticket, messages };
  }

  async findLatestOpenTicket(guestSessionId?: string, userId?: string) {
    if (!guestSessionId && !userId) return null;

    const whereClause = userId
      ? { userId, status: { in: this.openTicketStatuses } }
      : {
          guestSessionId: guestSessionId as string,
          status: { in: this.openTicketStatuses },
        };

    return this.prisma.supportTicket.findFirst({
      where: whereClause,
      include: {
        assignedAdmin: { select: { id: true, displayName: true } },
        user: { select: { id: true, displayName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdminTickets(adminId: string) {
    return this.prisma.supportTicket.findMany({
      where: {
        OR: [
          { status: SupportTicketStatus.PENDING },
          { status: SupportTicketStatus.ACTIVE, assignedAdminId: adminId },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
        messages: {
          where: { senderType: { not: SupportSenderType.SYSTEM } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async countUnreadAdminTickets(adminId?: string) {
    const unreadTickets = await this.prisma.supportMessage.groupBy({
      by: ['ticketId'],
      where: {
        isRead: false,
        senderType: { in: [SupportSenderType.GUEST, SupportSenderType.USER] },
        ticket: {
          OR: [
            { status: SupportTicketStatus.PENDING },
            {
              status: SupportTicketStatus.ACTIVE,
              assignedAdminId: adminId ?? '',
            },
          ],
        },
      },
      _count: { ticketId: true },
    });

    return unreadTickets.length;
  }

  async markTicketReadByAdmin(ticketId: string) {
    return this.prisma.supportMessage.updateMany({
      where: {
        ticketId,
        isRead: false,
        senderType: { in: [SupportSenderType.GUEST, SupportSenderType.USER] },
      },
      data: { isRead: true },
    });
  }

  async getPendingTickets() {
    return this.prisma.supportTicket.findMany({
      where: { status: SupportTicketStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
      },
    });
  }

  async createOrGetTicket(guestSessionId?: string, userId?: string) {
    if (!guestSessionId && !userId)
      throw new BadRequestException('Guest session or User ID required');

    const whereClause = userId
      ? { userId, status: { in: this.openTicketStatuses } }
      : {
          guestSessionId: guestSessionId as string,
          status: { in: this.openTicketStatuses },
        };

    const existingTicket = await this.prisma.supportTicket.findFirst({
      where: whereClause,
      include: {
        assignedAdmin: { select: { id: true, displayName: true } },
        user: { select: { id: true, displayName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingTicket) return existingTicket;

    return this.prisma.supportTicket.create({
      data: {
        guestSessionId: guestSessionId || null,
        userId: userId || null,
        status: SupportTicketStatus.PENDING,
      },
      include: {
        assignedAdmin: { select: { id: true, displayName: true } },
        user: { select: { id: true, displayName: true, email: true } },
      },
    });
  }

  async createCustomerMessage(input: {
    ticketId?: string;
    content: string;
    guestSessionId?: string;
    userId?: string;
  }) {
    if (!input.content || input.content.trim() === '') {
      throw new BadRequestException('Content is required');
    }

    let ticketId = input.ticketId;
    let ticket:
      | Awaited<ReturnType<SupportChatService['createOrGetTicket']>>
      | undefined;

    if (!ticketId) {
      ticket = await this.createOrGetTicket(input.guestSessionId, input.userId);
      ticketId = ticket.id;
    }

    const senderType = input.userId
      ? SupportSenderType.USER
      : SupportSenderType.GUEST;
    const message = await this.sendMessage(
      ticketId,
      senderType,
      input.content.trim(),
      input.userId || undefined,
    );

    return { ticket, ticketId, message };
  }

  async sendMessage(
    ticketId: string,
    senderType: SupportSenderType,
    content: string,
    senderId?: string,
  ) {
    const [message] = await this.prisma.$transaction([
      this.prisma.supportMessage.create({
        data: {
          ticketId,
          senderType,
          senderId: senderId || null,
          content,
        },
        include: {
          senderUser: {
            select: { id: true, displayName: true },
          },
        },
      }),
      this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return message;
  }

  async createMemberReplyNotification(input: {
    ticketId: string;
    messageId: string;
    content: string;
  }) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: input.ticketId },
      select: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!ticket?.user) return null;

    return this.prisma.notificationLog.create({
      data: {
        userId: ticket.user.id,
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: ticket.user.email || `user:${ticket.user.id}`,
        templateKey: 'customer.support.reply.v1',
        payload: {
          supportTicketId: input.ticketId,
          messageId: input.messageId,
          preview: this.notificationPreview(input.content),
        },
      },
    });
  }

  async createAdminCustomerMessageNotification(input: {
    ticketId: string;
    messageId: string;
    content: string;
  }) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: input.ticketId },
      select: {
        user: {
          select: {
            displayName: true,
          },
        },
      },
    });

    return this.prisma.notificationLog.create({
      data: {
        channel: 'IN_APP',
        status: 'QUEUED',
        recipient: 'ADMIN',
        templateKey: 'admin.support.customer_message.v1',
        payload: {
          supportTicketId: input.ticketId,
          messageId: input.messageId,
          customerName: ticket?.user?.displayName || 'Khách vãng lai',
          preview: this.notificationPreview(input.content),
        },
      },
    });
  }

  async claimTicket(ticketId: string, adminId: string) {
    const existing = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (
      existing &&
      existing.status === SupportTicketStatus.ACTIVE &&
      existing.assignedAdminId === adminId
    ) {
      return this.prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: { user: true },
      });
    }

    // Tiêu chuẩn vàng - Atomic update
    const result = await this.prisma.supportTicket.updateMany({
      where: {
        id: ticketId,
        status: SupportTicketStatus.PENDING,
      },
      data: {
        status: SupportTicketStatus.ACTIVE,
        assignedAdminId: adminId,
      },
    });

    if (result.count === 0) {
      throw new BadRequestException(
        'Ticket đã được tiếp nhận bởi người khác hoặc không còn tồn tại.',
      );
    }

    return this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: true },
    });
  }

  async mergeSession(guestSessionId: string, userId: string) {
    const guestTickets = await this.prisma.supportTicket.findMany({
      where: { guestSessionId },
      select: { id: true, status: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (guestTickets.length === 0) return null;

    const latestOpenTicket = guestTickets.find((ticket) =>
      this.openTicketStatuses.includes(ticket.status),
    );

    // Keep historical conversations attached to the account as well.
    await this.prisma.supportTicket.updateMany({
      where: { guestSessionId },
      data: {
        userId,
        guestSessionId: null,
      },
    });

    if (!latestOpenTicket) return null;

    const mergedTicket = await this.prisma.supportTicket.findUnique({
      where: { id: latestOpenTicket.id },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
      },
    });

    if (!mergedTicket) return null;

    const message = await this.prisma.supportMessage.create({
      data: {
        ticketId: mergedTicket.id,
        senderType: SupportSenderType.SYSTEM,
        content: 'Khách hàng đã đăng nhập tài khoản.',
      },
    });

    return { ticket: mergedTicket, message };
  }

  async closeTicket(ticketId: string) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: SupportTicketStatus.CLOSED,
        closedAt: new Date(),
      },
    });
  }

  private notificationPreview(content: string) {
    const normalized = content.replace(/\s+/g, ' ').trim();
    return normalized.length > 160
      ? `${normalized.slice(0, 157)}...`
      : normalized;
  }
}
