const fs = require('fs');
let p = 'src/app/(public)/huong-dan/page.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/const faqs: (FAQ|unknown)\[\] =/g, 'const faqs: any[] =');
c = c.replace(/<img /g, '<Image width={100} height={100} ');
c = c.replace(/<a\s+href=/g, '<Link href=');
c = c.replace(/<\/a>/g, '</Link>');

if (!c.includes("import Image")) {
  c = "import Image from 'next/image';\n" + c;
}
if (!c.includes("import Link")) {
  c = "import Link from 'next/link';\n" + c;
}

fs.writeFileSync(p, c);
console.log('Fixed huong-dan');
