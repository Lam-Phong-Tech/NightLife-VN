const fs = require('fs');
let p = 'src/app/(public)/huong-dan/page.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/const faqs: any\[\] =/g, `interface FAQItem {
  q?: string;
  icon?: string;
  ansStyle?: React.CSSProperties;
  a?: string;
  toggle?: () => void;
  [key: string]: any;
}
const faqs: FAQItem[] =`);

// Fix react-hooks/immutability
c = c.replace(/open: \(\) => window\.location\.href = '\/chi-tiet-quan'/g, "open: () => { window.location.href = '/chi-tiet-quan'; }");

// Fix unescaped entities
c = c.replace(/"hot"/g, '&quot;hot&quot;');

// Fix unexpected any if any is still there
c = c.replace(/: any\[\]/g, ': Record<string, any>[]');

fs.writeFileSync(p, c);
console.log('Fixed lint and types in huong-dan');
