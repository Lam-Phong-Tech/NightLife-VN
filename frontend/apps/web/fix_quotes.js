const fs = require('fs');
let p = 'src/app/(public)/huong-dan/page.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/"Lấy mã"/g, '&quot;Lấy mã&quot;');
c = c.replace(/"L\u1ea5y m\u00e3"/g, '&quot;Lấy mã&quot;');

fs.writeFileSync(p, c);
console.log('Fixed quotes');
