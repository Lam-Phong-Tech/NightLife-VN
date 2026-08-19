import { AdminNotificationService } from './admin-notification.service';

describe('AdminNotificationService', () => {
  it('uses the itinerary snapshot when a new tour has no stop bookings yet', async () => {
    const service = new AdminNotificationService(
      { get: jest.fn() } as any,
      {} as any,
    );
    const notifyAdmin = jest
      .spyOn(service as any, 'notifyAdmin')
      .mockResolvedValue('notification-1');

    await service.notifyTourBookingCreated({
      id: 'tour-booking-1',
      bookingCode: 'TR-123456',
      status: 'REQUESTED',
      scheduledAt: new Date('2026-08-30T12:00:00.000Z'),
      partySize: 2,
      titleSnapshot: 'Tour mới',
      itinerarySnapshot: [
        { order: 1, storeId: 'store-1', storeName: 'FANTASY', casts: [] },
        { order: 2, storeId: 'store-2', storeName: 'GRACE The Class', casts: [] },
        { order: 3, storeId: 'store-3', storeName: 'Acero', casts: [] },
      ],
      bookings: [],
    });

    expect(notifyAdmin).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          '📍 Lịch trình tour: \n1. FANTASY\n2. GRACE The Class\n3. Acero',
        ),
        payload: expect.objectContaining({
          stops: [
            expect.objectContaining({ order: 1, storeName: 'FANTASY' }),
            expect.objectContaining({ order: 2, storeName: 'GRACE The Class' }),
            expect.objectContaining({ order: 3, storeName: 'Acero' }),
          ],
        }),
      }),
    );
  });
});
