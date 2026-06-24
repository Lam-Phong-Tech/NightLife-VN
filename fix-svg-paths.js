const fs = require('fs');
const path = require('path');
const dir = 'd:/NightLife-VN/frontend/apps/web/public/icons';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Replace <path d="..." with <path fill="#6d28d9" d="..." 
  // only if the <path> does not contain fill= or stroke= or class=
  content = content.replace(/<path\s+(?!.*(?:fill|stroke|class)=)([^>]*?)d="/g, '<path fill="#6d28d9" $1d="');

  // Same for <polygon>, <circle>, <rect> if needed
  content = content.replace(/<polygon\s+(?!.*(?:fill|stroke|class)=)([^>]*?)points="/g, '<polygon fill="#6d28d9" $1points="');
  content = content.replace(/<circle\s+(?!.*(?:fill|stroke|class)=)([^>]*?)cx="/g, '<circle fill="#6d28d9" $1cx="');

  fs.writeFileSync(path.join(dir, file), content);
  console.log('Fixed paths for ' + file);
}
