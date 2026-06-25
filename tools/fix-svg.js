const fs = require('fs');
const path = require('path');
const dir = 'd:/NightLife-VN/frontend/apps/web/public/icons';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  if (!content.includes('fill="#6d28d9"')) {
    content = content.replace(/<svg /, '<svg fill="#6d28d9" ');
  }
  fs.writeFileSync(path.join(dir, file), content);
  console.log('Fixed fill for ' + file);
}
