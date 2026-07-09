const fs = require('fs');
const path = 'frontend/apps/web/src/app/admin/ranking/page.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(
  "import { apiClient } from '@/lib/api/client';",
  "import { apiClient } from '@/lib/api/client';\nimport { useSystemFeedback } from '@/components/ui/SystemFeedback';"
);

c = c.replace(
  "const { item, index, isStore, toggleSponsor, moveItem, removeItem } = props;\n  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });",
  "const { item, index, isStore, toggleSponsor, moveItem, removeItem } = props;\n  const feedback = useSystemFeedback();\n  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });"
);

c = c.replace(
  "if(window.confirm('Bạn có chắc chắn muốn gỡ '+item.name+' khỏi bảng xếp hạng không?')) {\n      removeItem(item.id);\n    }",
  "feedback.showModal({\n      title: 'Xác nhận gỡ',\n      description: 'Bạn có chắc chắn muốn gỡ '+item.name+' khỏi bảng xếp hạng không?',\n      onPrimary: () => {\n        removeItem(item.id);\n        feedback.closeModal();\n      }\n    });"
);

fs.writeFileSync(path, c, 'utf8');
