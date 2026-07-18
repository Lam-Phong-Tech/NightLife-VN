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

  private readonly openTicketStatuses = [
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
    // 1. Update all tickets of this session to this userId
    await this.prisma.supportTicket.updateMany({
      where: { guestSessionId },
      data: {
        userId,
        guestSessionId: null,
      },
    });

    // 2. Find the active ticket to send a system message
    const activeTicket = await this.prisma.supportTicket.findFirst({
      where: { userId, status: SupportTicketStatus.ACTIVE },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
      },
    });

    if (activeTicket) {
      const message = await this.prisma.supportMessage.create({
        data: {
          ticketId: activeTicket.id,
          senderType: SupportSenderType.SYSTEM,
          content: 'Khách hàng đã đăng nhập tài khoản.',
        },
      });
      return { ticket: activeTicket, message };
    }
    return null;
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
}
