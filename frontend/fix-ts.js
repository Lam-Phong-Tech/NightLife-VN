const fs = require('fs');
const path = require('path');

function replaceFile(filePath, search, replace) {
  const absPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(absPath)) return;
  let content = fs.readFileSync(absPath, 'utf8');
  content = content.split(search).join(replace);
  fs.writeFileSync(absPath, content);
}

// 1. tai-khoan/page.tsx
replaceFile('apps/web/src/app/(member)/tai-khoan/page.tsx', 'src={m.icon}', 'src={m.icon || ""}');

// 2. vi-uu-dai/page.tsx
replaceFile('apps/web/src/app/(member)/vi-uu-dai/page.tsx', "dim: ''", "dim: false");
replaceFile('apps/web/src/app/(member)/vi-uu-dai/page.tsx', "...c.dim", "...(c.dim ? { opacity: 0.5 } : {})");

// 3. casts/[slug]/page.tsx
replaceFile('apps/web/src/app/(public)/casts/[slug]/page.tsx', "video: false", "isVideo: false");
replaceFile('apps/web/src/app/(public)/casts/[slug]/page.tsx', "video: true", "isVideo: true");

// 4. dang-nhap/page.tsx
replaceFile('apps/web/src/app/(public)/dang-nhap/page.tsx', 'const pickLogin = () => setIsReg(false);', 'const [isReg, setIsReg] = useState(false);\n    const pickLogin = () => setIsReg(false);');
replaceFile('apps/web/src/app/(public)/dang-nhap/page.tsx', 'const isReg: MockItem | undefined = undefined;', '// removed isReg');

// 5. danh-sach-cast/page.tsx
replaceFile('apps/web/src/app/(public)/danh-sach-cast/page.tsx', "src={c.favIcon}", 'src={c.favIcon || ""}');

// 6. tour/page.tsx
replaceFile('apps/web/src/app/(public)/tour/page.tsx', "import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { MockItem } from '@/types';");

// 7. xep-hang/page.tsx
replaceFile('apps/web/src/app/(public)/xep-hang/page.tsx', "import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { MockItem } from '@/types';");
replaceFile('apps/web/src/app/(public)/xep-hang/page.tsx', "rank: '1'", "rank: 1");
replaceFile('apps/web/src/app/(public)/xep-hang/page.tsx', "rank: '2'", "rank: 2");
replaceFile('apps/web/src/app/(public)/xep-hang/page.tsx', "rank: '3'", "rank: 3");

console.log('done');
