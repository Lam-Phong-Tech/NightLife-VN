const fs = require('fs');
const path = require('path');

const srcDir = 'd:/NightLife-VN/frontend/SVG';
const destDir = 'd:/NightLife-VN/frontend/apps/web/public/icons';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.svg'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
  // Replace #000000, #000, black with #6d28d9
  let newContent = content.replace(/#000000/g, '#6d28d9');
  newContent = newContent.replace(/#000;/g, '#6d28d9;');
  newContent = newContent.replace(/:black;/g, ':#6d28d9;');
  newContent = newContent.replace(/="black"/g, '="#6d28d9"');
  newContent = newContent.replace(/stroke="currentColor"/g, 'stroke="#6d28d9"');
  newContent = newContent.replace(/fill="currentColor"/g, 'fill="#6d28d9"');

  let destFile = file.toLowerCase().replace(/ /g, '-');
  // "uu daI.svg" -> "uu-dai.svg"
  
  fs.writeFileSync(path.join(destDir, destFile), newContent);
  console.log('Processed', file, '->', destFile);
});
