import { TourService } from './tour.service';

describe('TourService public cast visibility', () => {
  const deletedCastId = 'f0cf336c-8813-484d-9bb5-ec50862f174f';

  it('filters deleted, non-public, and pending-edit source casts without truncating the total', () => {
    const service = new TourService({} as any);
    const select = (service as any).publicTourStoreSelect(
      new Date('2026-08-16T00:00:00.000Z'),
      'GUEST',
      [deletedCastId],
    );

    expect(select.casts).toMatchObject({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        isPublic: true,
        id: { notIn: [deletedCastId] },
      },
    });
    expect(select.casts).not.toHaveProperty('take');
  });

  it('finds the original casts hidden by pending partner listing edits', async () => {
    const prisma = {
      cast: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { slug: `partner-cast-edit-${deletedCastId}` },
            { slug: 'partner-cast-edit-not-a-cast-id' },
          ]),
      },
    };
    const service = new TourService(prisma as any);

    await expect(
      (service as any).pendingPartnerListingCastEditSourceIds(),
    ).resolves.toEqual([deletedCastId]);
  });
});
