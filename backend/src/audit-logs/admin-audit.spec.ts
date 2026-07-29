import { buildAdminAuditLog, changedAuditFields } from './admin-audit';

describe('admin audit helpers', () => {
  const actor = {
    id: 'admin-id',
    email: 'admin@example.com',
    role: 'SUPER_ADMIN',
  };

  it('snapshots the administrative actor and standard audit fields', () => {
    const data = buildAdminAuditLog({
      actor,
      module: 'Store',
      action: 'store.update',
      targetType: 'Store',
      targetId: 'store-id',
      before: { name: 'Tên cũ', city: 'Hà Nội' },
      after: { name: 'Tên mới', city: 'Hà Nội' },
      changeSummary: 'Đã cập nhật quán',
    });

    expect(data).toEqual(
      expect.objectContaining({
        actorId: 'admin-id',
        actorType: 'ADMIN',
        actorName: 'admin@example.com',
        actorRole: 'SUPER_ADMIN',
        module: 'Store',
        action: 'store.update',
        changedFields: ['name'],
        result: 'SUCCESS',
      }),
    );
  });

  it('compares nested and scalar values when collecting changed fields', () => {
    expect(
      changedAuditFields(
        { status: 'ACTIVE', tags: ['bar'] },
        { status: 'DELETED', tags: ['bar'] },
      ),
    ).toEqual(['status']);
  });
});
