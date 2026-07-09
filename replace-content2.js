const fs = require('fs');
const path = 'frontend/apps/web/src/app/admin/content/page.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(
  "if (!confirm('Bạn có chắc muốn gỡ khỏi trang chủ?')) return;",
  `feedback.showModal({
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
    }); return;`
);

c = c.replace(
  "if (!window.confirm('Bạn có chắc chắn muốn xóa nhãn này?')) return;",
  `feedback.showModal({
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
    }); return;`
);

c = c.replace(
  "if (!confirm('Bạn có chắc chắn muốn xóa chuyên mục này?')) return;",
  `feedback.showModal({
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
    }); return;`
);

c = c.replace(
  "if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) return;",
  `feedback.showModal({
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
    }); return;`
);

// We need to remove the "try { ... } catch (err) { ... }" blocks that followed the old "if (!confirm) return;" 
// because now they are inside the "onPrimary" callback.
// Since it's hard to remove blocks generically via replace, let me just rewrite the whole functions!

fs.writeFileSync('frontend/apps/web/src/app/admin/content/page.tsx', c, 'utf8');
