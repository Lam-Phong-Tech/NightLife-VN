import { Permission, PrismaClient, Role } from '@prisma/client';

const ROLES = [
  {
    key: 'super_admin',
    name: 'Quản trị viên tối cao (Super Admin)',
    description:
      'Quyền truy cập toàn bộ hệ thống, bao gồm cấu hình và xóa dữ liệu vĩnh viễn',
    level: 100,
  },
  {
    key: 'admin',
    name: 'Quản trị viên (Admin)',
    description:
      'Quản lý toàn bộ quán, cast, đặt chỗ, hóa đơn, xếp hạng và cài đặt',
    level: 80,
  },
  {
    key: 'operator',
    name: 'Nhân viên vận hành (Operator)',
    description:
      'Xử lý vận hành: quản lý đặt chỗ, quét mã QR và duyệt danh sách hóa đơn',
    level: 50,
  },
  {
    key: 'staff',
    name: 'Nhân viên quán (Staff)',
    description:
      'Vai trò nhân viên hỗ trợ nội bộ trực thuộc cửa hàng',
    level: 40,
  },
  {
    key: 'partner',
    name: 'Đối tác (Partner)',
    description:
      'Đăng nhập đối tác: quét mã QR và xác nhận check-in cho khách',
    level: 30,
  },
  {
    key: 'member',
    name: 'Thành viên (Member)',
    description: 'Tài khoản khách hàng đăng nhập với quyền lợi thành viên và VIP',
    level: 10,
  },
];

const PERMISSIONS = [
  {
    key: 'store.partner.view',
    name: 'Xem quán thuộc phạm vi',
    description: 'Xem danh sách các quán trong phạm vi đối tác/vận hành',
    roleKeys: ['super_admin', 'admin', 'partner', 'operator'],
  },
  {
    key: 'coupon.partner.view',
    name: 'Xem mã ưu đãi thuộc phạm vi',
    description: 'Xem danh sách mã ưu đãi thuộc quán trong phạm vi',
    roleKeys: ['super_admin', 'admin', 'partner', 'operator'],
  },
  {
    key: 'booking.partner.view',
    name: 'Xem đặt chỗ thuộc phạm vi',
    description: 'Xem danh sách đặt chỗ (booking) thuộc phạm vi quản lý',
    roleKeys: ['super_admin', 'admin', 'partner', 'operator'],
  },
  {
    key: 'bill.partner.view',
    name: 'Xem hóa đơn thuộc phạm vi',
    description: 'Xem danh sách hóa đơn thanh toán thuộc phạm vi quản lý',
    roleKeys: ['super_admin', 'admin', 'partner', 'operator'],
  },
  {
    key: 'coupon.scan',
    name: 'Quét mã QR ưu đãi',
    description: 'Quét mã QR ưu đãi của khách hàng tại quán',
    roleKeys: ['super_admin', 'admin', 'partner', 'operator'],
  },
  {
    key: 'checkin.confirm',
    name: 'Xác nhận check-in',
    description: 'Xác nhận lượt check-in của khách sau khi quét mã QR',
    roleKeys: ['super_admin', 'admin', 'partner', 'operator'],
  },
  {
    key: 'bill.review',
    name: 'Duyệt hóa đơn (Legacy)',
    description:
      'Quyền duyệt hóa đơn cũ (giữ lại để tương thích hệ thống cũ)',
    roleKeys: ['super_admin', 'admin'],
  },
  {
    key: 'bill.approval.preview',
    name: 'Xem trước phê duyệt hóa đơn',
    description:
      'Xem trước tổng tiền, giảm giá, hoa hồng và tích điểm trước khi duyệt',
    roleKeys: ['super_admin', 'admin'],
  },
  {
    key: 'bill.approve',
    name: 'Duyệt hoặc từ chối hóa đơn',
    description:
      'Phê duyệt hoặc từ chối hóa đơn gửi lên trong quy trình duyệt Admin',
    roleKeys: ['super_admin', 'admin'],
  },
  {
    key: 'bill.pm_ba.confirm',
    name: 'Xác nhận hóa đơn hoa hồng âm (PM/BA)',
    description:
      'Xác nhận lý do PM/BA cho hóa đơn hoa hồng âm trước khi xác minh cuối',
    roleKeys: ['super_admin', 'admin'],
  },
  {
    key: 'bill.void',
    name: 'Hủy bỏ hóa đơn đã duyệt',
    description:
      'Hủy bỏ hoặc hoàn tiền hóa đơn đã duyệt và thu hồi điểm thưởng liên quan',
    roleKeys: ['super_admin', 'admin'],
  },
  {
    key: 'bill.reverse',
    name: 'Đảo ngược hóa đơn đã duyệt',
    description:
      'Hoàn tác/đảo ngược hóa đơn đã duyệt thủ công hoặc qua luồng tự động rủi ro cao',
    roleKeys: ['super_admin', 'admin'],
  },
  {
    key: 'bill.sensitive.view',
    name: 'Xem danh sách hóa đơn nhạy cảm',
    description: 'Xem danh sách hóa đơn chờ duyệt với chế độ ẩn thông tin theo vai trò',
    roleKeys: ['super_admin', 'admin', 'operator'],
  },
  {
    key: 'report.revenue.view',
    name: 'Xem báo cáo doanh thu',
    description: 'Xem báo cáo tổng quan về doanh thu, chiết khấu và hoa hồng',
    roleKeys: ['super_admin', 'admin'],
  },
  {
    key: 'booking.member.view',
    name: 'Xem đặt chỗ cá nhân',
    description: 'Xem danh sách đặt chỗ của chính tài khoản khách hàng',
    roleKeys: ['super_admin', 'admin', 'member'],
  },
  {
    key: 'coupon.member.view',
    name: 'Xem mã ưu đãi cá nhân',
    description: 'Xem danh sách mã ưu đãi sở hữu bởi tài khoản khách hàng',
    roleKeys: ['super_admin', 'admin', 'member'],
  },
  {
    key: 'coupon.member.claim',
    name: 'Nhận mã ưu đãi thành viên',
    description: 'Thu thập mã ưu đãi dành cho thành viên hoặc VIP',
    roleKeys: ['member'],
  },
  {
    key: 'ranking.manage',
    name: 'Quản lý bảng xếp hạng',
    description: 'Thiết lập và quản lý thứ hạng danh mục toàn hệ thống',
    roleKeys: ['super_admin', 'admin'],
  },
  {
    key: 'coupon.issue.manage',
    name: 'Quản lý lượt phát mã ưu đãi',
    description: 'Thu hồi hoặc xoay vòng (rotate) mã QR lượt phát ưu đãi',
    roleKeys: ['super_admin', 'admin'],
  },
  {
    key: 'booking.reschedule.review',
    name: 'Duyệt yêu cầu đổi lịch đặt chỗ',
    description: 'Xem và phê duyệt các yêu cầu thay đổi thời gian đặt chỗ',
    roleKeys: ['super_admin', 'admin', 'operator'],
  },
  {
    key: 'booking.chat.manage',
    name: 'Quản lý hội thoại hỗ trợ booking',
    description: 'Truy cập và gửi tin nhắn trong kênh chat hỗ trợ đặt chỗ',
    roleKeys: ['super_admin', 'admin', 'operator'],
  },
  {
    key: 'booking.cancel',
    name: 'Hủy đặt chỗ thay mặt khách',
    description: 'Hủy đặt chỗ thay khách hàng bỏ qua giới hạn thời gian (cutoff rules)',
    roleKeys: ['super_admin', 'admin', 'operator'],
  },
  {
    key: 'report.cancel_analytics.view',
    name: 'Xem phân tích tỷ lệ hủy',
    description: 'Xem biểu đồ và báo cáo thống kê tỷ lệ hủy đặt chỗ',
    roleKeys: ['super_admin', 'admin', 'operator'],
  },
  {
    key: 'store.policy.update',
    name: 'Cập nhật chính sách quán',
    description: 'Chỉnh sửa chính sách đặt chỗ của quán (như giới hạn thời gian hủy)',
    roleKeys: ['super_admin', 'admin', 'operator'],
  },
  {
    key: 'media.protected.read',
    name: 'Truy cập tệp phương tiện bảo mật',
    description:
      'Xem các tệp hình ảnh/video giới hạn theo chủ sở hữu hoặc cửa hàng',
    roleKeys: ['super_admin', 'admin', 'operator', 'staff'],
  },
  {
    key: 'system.storage.config',
    name: 'Cấu hình dung lượng VPS',
    description: 'Cấu hình hạn mức lưu trữ tối đa cho hệ thống VPS',
    roleKeys: ['super_admin'],
  },
  {
    key: 'system.storage.view',
    name: 'Xem dung lượng VPS',
    description: 'Xem tình trạng sử dụng dung lượng lưu trữ VPS hiện tại',
    roleKeys: ['super_admin', 'admin'],
  },
  {
    key: 'system.hard_delete',
    name: 'Xóa vĩnh viễn dữ liệu',
    description: 'Xóa hoàn toàn bản ghi khỏi cơ sở dữ liệu (không thể khôi phục)',
    roleKeys: ['super_admin'],
  },
  {
    key: 'system.role.assign',
    name: 'Phân quyền tài khoản',
    description: 'Gán vai trò và quyền hạn cho người dùng khác',
    roleKeys: ['super_admin', 'admin'],
  },
  {
    key: 'store.admin.view',
    name: 'Xem danh sách quán CMS',
    description: 'Xem danh sách tất cả địa điểm quán trên trang quản trị Admin',
    roleKeys: ['super_admin', 'admin', 'operator'],
  },
  {
    key: 'cast.admin.view',
    name: 'Xem danh sách Cast CMS',
    description: 'Xem danh sách nhân sự (Cast) trên trang quản trị Admin',
    roleKeys: ['super_admin', 'admin', 'operator'],
  },
  {
    key: 'partner.request.view',
    name: 'Xem yêu cầu đăng ký đối tác',
    description: 'Xem danh sách đơn đăng ký đối tác gửi đến hệ thống',
    roleKeys: ['super_admin', 'admin', 'operator'],
  },
  {
    key: 'content.admin.view',
    name: 'Xem quản lý nội dung CMS',
    description: 'Xem bài viết, trang nội dung và truyền thông trên Admin',
    roleKeys: ['super_admin', 'admin', 'operator'],
  },
  {
    key: 'coupon.issue.view',
    name: 'Xem lịch sử phát mã ưu đãi',
    description: 'Xem toàn bộ lịch sử các mã ưu đãi đã phát ra trên hệ thống',
    roleKeys: ['super_admin', 'admin', 'operator'],
  },
  {
    key: 'report.dashboard.view',
    name: 'Xem dashboard thống kê Admin',
    description: 'Xem chỉ số tổng quan, biểu đồ và xuất báo cáo dữ liệu Admin',
    roleKeys: ['super_admin', 'admin', 'operator'],
  },
  {
    key: 'booking.status.update',
    name: 'Cập nhật trạng thái đặt chỗ',
    description: 'Cập nhật trạng thái xử lý của đơn đặt chỗ trên Admin CMS',
    roleKeys: ['super_admin', 'admin', 'operator'],
  },
];

export async function seedRoles(
  prisma: PrismaClient,
): Promise<Record<string, Role>> {
  console.log('  Seeding roles...');
  const result: Record<string, Role> = {};

  for (const r of ROLES) {
    result[r.key] = await prisma.role.upsert({
      where: { key: r.key },
      update: { name: r.name, description: r.description, level: r.level, status: 'ACTIVE' },
      create: {
        key: r.key,
        name: r.name,
        description: r.description,
        level: r.level,
        status: 'ACTIVE',
      },
    });
  }

  console.log(`     ${Object.keys(result).length} roles`);
  return result;
}

export async function seedPermissions(
  prisma: PrismaClient,
  roles: Record<string, Role>,
): Promise<Record<string, Permission>> {
  console.log('  Seeding permissions...');
  const result: Record<string, Permission> = {};

  for (const p of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { key: p.key },
      update: { name: p.name, description: p.description },
      create: { key: p.key, name: p.name, description: p.description },
    });

    result[p.key] = permission;

    for (const roleKey of p.roleKeys) {
      const role = roles[roleKey];
      if (!role) {
        continue;
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }

    const expectedRoleIds = p.roleKeys
      .map((k) => roles[k]?.id)
      .filter(Boolean) as string[];
    await prisma.rolePermission.deleteMany({
      where: {
        permissionId: permission.id,
        roleId: { notIn: expectedRoleIds },
      },
    });
  }

  console.log(`     ${Object.keys(result).length} permissions`);
  return result;
}
