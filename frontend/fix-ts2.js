const fs = require('fs');
const path = require('path');

function replaceFile(filePath, search, replace) {
  const absPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(absPath)) return;
  let content = fs.readFileSync(absPath, 'utf8');
  content = content.split(search).join(replace);
  fs.writeFileSync(absPath, content);
}

// dang-nhap
replaceFile('apps/web/src/app/(public)/dang-nhap/page.tsx', 'style={isReg}', 'style={sLogin}');
replaceFile('apps/web/src/app/(public)/dang-nhap/page.tsx', 'const sLogin: MockItem | undefined = undefined;', 'const sLogin: React.CSSProperties | undefined = undefined;');

// tour
// Just add info to MockItem in types/index.ts
replaceFile('apps/web/src/types/index.ts', 'price?: string | number;', 'price?: string | number;\n  info?: string;');
replaceFile('apps/web/src/types/index.ts', 'rank?: number;', 'rank?: number;\n  numColor?: string;\n  crown?: string;\n  metric?: string | number;');

// xep-hang
replaceFile('apps/web/src/app/(public)/xep-hang/page.tsx', "rank: '4'", "rank: 4");
replaceFile('apps/web/src/app/(public)/xep-hang/page.tsx', "rank: '5'", "rank: 5");
replaceFile('apps/web/src/app/(public)/xep-hang/page.tsx', "rank: '6'", "rank: 6");
replaceFile('apps/web/src/app/(public)/xep-hang/page.tsx', "rank: '7'", "rank: 7");
replaceFile('apps/web/src/app/(public)/xep-hang/page.tsx', "rank: '8'", "rank: 8");

console.log('done');
