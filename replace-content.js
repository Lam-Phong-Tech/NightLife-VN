const fs = require('fs');
const path = 'frontend/apps/web/src/app/admin/content/page.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(
  "alert(`Không thể thêm vào danh sách nổi bật: ${err?.response?.data?.message || err.message || ''}`);",
  "feedback.showToast({ title: `Không thể thêm vào danh sách nổi bật: ${err?.response?.data?.message || err.message || ''}`, tone: 'error' });"
);

c = c.replace(
  "alert('Không thể gỡ.');",
  "feedback.showToast({ title: 'Không thể gỡ.', tone: 'error' });"
);

c = c.replace(
  "alert('Không thể đổi vị trí.');",
  "feedback.showToast({ title: 'Không thể đổi vị trí.', tone: 'error' });"
);

c = c.replace(
  "alert('Đã lưu danh sách Video Hot thành công');",
  "feedback.showToast({ title: 'Đã lưu danh sách Video Hot thành công', tone: 'success' });"
);

c = c.replace(
  "alert('Có lỗi xảy ra khi lưu');",
  "feedback.showToast({ title: 'Có lỗi xảy ra khi lưu', tone: 'error' });"
);

c = c.replace(
  "alert('Có lỗi xảy ra khi thêm nhãn');",
  "feedback.showToast({ title: 'Có lỗi xảy ra khi thêm nhãn', tone: 'error' });"
);

c = c.replace(
  "alert('Có lỗi xảy ra khi xóa nhãn');",
  "feedback.showToast({ title: 'Có lỗi xảy ra khi xóa nhãn', tone: 'error' });"
);

c = c.replace(
  "alert('Có lỗi xảy ra khi thêm chuyên mục.');",
  "feedback.showToast({ title: 'Có lỗi xảy ra khi thêm chuyên mục.', tone: 'error' });"
);

c = c.replace(
  "alert('Có lỗi xảy ra khi xóa chuyên mục.');",
  "feedback.showToast({ title: 'Có lỗi xảy ra khi xóa chuyên mục.', tone: 'error' });"
);

c = c.replace(
  "alert('Lỗi khi xóa banner');",
  "feedback.showToast({ title: 'Lỗi khi xóa banner', tone: 'error' });"
);

// Confirms -> need to use feedback.showModal
const confirm1Old = `    if (!confirm('Bạn có chắc muốn gỡ khỏi trang chủ?')) return;
    try {
      await contentApi.adminRemoveFeatured(item.id);
      fetchFeaturedContent();
    } catch (err) {
      feedback.showToast({ title: 'Không thể gỡ.', tone: 'error' });
    }`;
const confirm1New = `    feedback.showModal({
      title: 'Xác nhận gỡ',
      description: 'Bạn có chắc muốn gỡ khỏi trang chủ?',
      onPrimary: async () => {
        try {
          await contentApi.adminRemoveFeatured(item.id);
          fetchFeaturedContent();
          feedback.closeModal();
        } catch (err) {
          feedback.showToast({ title: 'Không thể gỡ.', tone: 'error' });
        }
      }
    });`;
c = c.replace(confirm1Old, confirm1New);

const confirm2Old = `  const handleRemoveTag = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhãn này?')) return;
    try {
      await apiClient(\`/admin/content/tags/\${id}\`, { method: 'DELETE' });
      fetchTags();
    } catch (error) {
      console.error(error);
      feedback.showToast({ title: 'Có lỗi xảy ra khi xóa nhãn', tone: 'error' });
    }
  };`;
const confirm2New = `  const handleRemoveTag = async (id: string) => {
    feedback.showModal({
      title: 'Xóa nhãn',
      description: 'Bạn có chắc chắn muốn xóa nhãn này?',
      onPrimary: async () => {
        try {
          await apiClient(\`/admin/content/tags/\${id}\`, { method: 'DELETE' });
          fetchTags();
          feedback.closeModal();
        } catch (error) {
          console.error(error);
          feedback.showToast({ title: 'Có lỗi xảy ra khi xóa nhãn', tone: 'error' });
        }
      }
    });
  };`;
c = c.replace(confirm2Old, confirm2New);

const confirm3Old = `  const handleRemoveCategory = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chuyên mục này?')) return;
    try {
      await apiClient(\`/admin/content/categories/\${id}\`, { method: 'DELETE' });
      fetchCategories();
    } catch (error) {
      console.error(error);
      feedback.showToast({ title: 'Có lỗi xảy ra khi xóa chuyên mục.', tone: 'error' });
    }
  };`;
const confirm3New = `  const handleRemoveCategory = async (id: string) => {
    feedback.showModal({
      title: 'Xóa chuyên mục',
      description: 'Bạn có chắc chắn muốn xóa chuyên mục này?',
      onPrimary: async () => {
        try {
          await apiClient(\`/admin/content/categories/\${id}\`, { method: 'DELETE' });
          fetchCategories();
          feedback.closeModal();
        } catch (error) {
          console.error(error);
          feedback.showToast({ title: 'Có lỗi xảy ra khi xóa chuyên mục.', tone: 'error' });
        }
      }
    });
  };`;
c = c.replace(confirm3Old, confirm3New);

const confirm4Old = `  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) return;
    try {
      await apiClient(\`/admin/content/banners/\${id}\`, { method: 'DELETE' });
      fetchBanners();
    } catch (e) {
      feedback.showToast({ title: 'Lỗi khi xóa banner', tone: 'error' });
    }
  };`;
const confirm4New = `  const handleDeleteBanner = async (id: string) => {
    feedback.showModal({
      title: 'Xóa banner',
      description: 'Bạn có chắc chắn muốn xóa banner này?',
      onPrimary: async () => {
        try {
          await apiClient(\`/admin/content/banners/\${id}\`, { method: 'DELETE' });
          fetchBanners();
          feedback.closeModal();
        } catch (e) {
          feedback.showToast({ title: 'Lỗi khi xóa banner', tone: 'error' });
        }
      }
    });
  };`;
c = c.replace(confirm4Old, confirm4New);

fs.writeFileSync(path, c, 'utf8');
