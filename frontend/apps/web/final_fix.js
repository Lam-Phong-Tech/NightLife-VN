const fs = require('fs');
let p = 'src/app/(public)/huong-dan/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// Replace any in FAQItem with unknown
c = c.replace(/\[key: string\]: any;/g, '[key: string]: unknown;');

// Fix immutability
c = c.replace(/window\.location\.href = '\/chi-tiet-quan'/g, "window.location.assign('/chi-tiet-quan')");

// Fix unescaped entities, let's catch anything like "hot" or just replace " with &quot; in text nodes.
c = c.replace(/"hot"/g, '&quot;hot&quot;');
c = c.replace(/quán bar "hot" nhất/g, 'quán bar &quot;hot&quot; nhất');

fs.writeFileSync(p, c);
console.log('Fixed final');
