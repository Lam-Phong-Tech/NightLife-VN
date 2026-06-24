const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('d:/NightLife-VN/frontend/apps/web/src/app');
let modifiedCount = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const original = content;
  // Remove dangerouslySetInnerHTML styles
  content = content.replace(/<style dangerouslySetInnerHTML=\{\{__html: `[\s\S]*?`\}\} \/>/g, '');
  // Remove preconnect and font links since we use next/font
  content = content.replace(/<link rel="preconnect"[^>]*\/>/g, '');
  content = content.replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*\/>/g, '');
  
  // Quick fix for window.location.href in inline components -> use Next router
  // We can't easily transform everything to <Link> safely without breaking JSX, 
  // so we'll replace `window.location.href = '...'` with `router.push('...')` where possible,
  // or leave it for manual if it's too complex.
  
  if (content !== original) {
    fs.writeFileSync(f, content);
    modifiedCount++;
  }
});
console.log(`Removed inline styles from ${modifiedCount} files.`);
