import fs from 'fs';
import path from 'path';

const srcDir = 'd:/NightLife-VN/Wirefame_Nightlight/app/desktop';
const destDir = 'd:/NightLife-VN/frontend/apps/web/src/app';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));

function camelCase(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

files.forEach(file => {
  let content = fs.readFileSync(path.join(srcDir, file), 'utf8');

  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyContent = bodyMatch ? bodyMatch[1] : content;

  // 1. Template interpolations {{ var }} to {var}
  bodyContent = bodyContent.replace(/="\{\{\s*(.*?)\s*\}\}"/g, '={$1}');
  bodyContent = bodyContent.replace(/\{\{\s*(.*?)\s*\}\}/g, '{$1}');

  // Remove the prototype header
  bodyContent = bodyContent.replace(/<div style="max-width:1100px;margin-bottom:22px;[\s\S]*?<\/div>\s*<\/div>\s*/g, '');

  // Make main container full width
  bodyContent = bodyContent.replace(/width:1100px;/g, 'width:100%;');
  // Also fix the wrapper from max-content to 100%
  bodyContent = bodyContent.replace(/width:max-content;/g, 'width:100%;');
  
  // Remove padding from outer wrapper
  bodyContent = bodyContent.replace(/padding:34px 48px 64px;/g, 'padding:0px;');
  // Remove border-radius from inner wrapper
  bodyContent = bodyContent.replace(/width:100%;background:#f5f4f2;border-radius:16px;/g, 'width:100%;background:#f5f4f2;border-radius:0px;');

  bodyContent = bodyContent.replace(/\bclass="/g, 'className="');
  bodyContent = bodyContent.replace(/\bfor="/g, 'htmlFor="');
  bodyContent = bodyContent.replace(/\bcrossorigin\b/g, 'crossOrigin=""');

  bodyContent = bodyContent.replace(/style="([^"]*)"/g, (match, styles) => {
    const obj = {};
    styles.split(';').forEach(s => {
      const parts = s.split(':');
      if (parts.length >= 2) {
        let key = parts[0].trim();
        if (!key.startsWith('--')) {
           key = camelCase(key);
        }
        const val = parts.slice(1).join(':').trim();
        if (key) obj[key] = val;
      }
    });
    return `style={${JSON.stringify(obj)}}`;
  });

  const voidElements = ['img', 'input', 'br', 'hr', 'link', 'meta'];
  voidElements.forEach(tag => {
    const regex = new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'gi');
    bodyContent = bodyContent.replace(regex, (match, p1) => {
      if (p1.trim().endsWith('/')) return match;
      return `<${tag}${p1} />`;
    });
  });

  bodyContent = bodyContent.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

  bodyContent = bodyContent.replace(/<sc-for list=\{([^}]+)\}\s+as="([^"]+)"[^>]*>/g, '{$1?.map(($2, index) => (<React.Fragment key={index}>');
  bodyContent = bodyContent.replace(/<\/sc-for>/g, '</React.Fragment>))}');

  bodyContent = bodyContent.replace(/<sc-if[^>]*>/g, '<>');
  bodyContent = bodyContent.replace(/<\/sc-if>/g, '</>');

  bodyContent = bodyContent.replace(/<helmet>/gi, '<>');
  bodyContent = bodyContent.replace(/<\/helmet>/gi, '</>');
  bodyContent = bodyContent.replace(/<x-dc>/gi, '<>');
  bodyContent = bodyContent.replace(/<\/x-dc>/gi, '</>');

  // We should also strip out the custom script tags that broke xac-nhan:
  // <script type="text/x-dc" data-dc-script> ... </script>
  bodyContent = bodyContent.replace(/<script[^>]*text\/x-dc[^>]*>([\s\S]*?)<\/script>/gi, '');

  bodyContent = bodyContent.replace(/<style>([\s\S]*?)<\/style>/gi, (match, p1) => {
    return `<style dangerouslySetInnerHTML={{__html: \`${p1.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`}} />`;
  });

  let routeName = file.replace('.html', '');
  let isHome = routeName === 'trang-chu';
  
  let pageDir = isHome ? destDir : path.join(destDir, routeName);
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }

  // FIX: Make sure mapRegex only matches valid variable names
  const mapRegex = /\{([a-zA-Z_$][a-zA-Z0-9_$]*)\?\.map\(\(([^,]+)/g;
  let match;
  const lists = [];
  while ((match = mapRegex.exec(bodyContent)) !== null) {
    lists.push(match[1].trim());
  }

  const varRegex = /\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}/g;
  const standaloneVars = new Set();
  let vMatch;
  while ((vMatch = varRegex.exec(bodyContent)) !== null) {
    standaloneVars.add(vMatch[1]);
  }
  
  const excludeVars = ['React', 'index'];
  lists.forEach(l => standaloneVars.delete(l));

  const pathRegex = /\{([a-zA-Z_$][a-zA-Z0-9_$]*)\./g;
  while ((vMatch = pathRegex.exec(bodyContent)) !== null) {
    standaloneVars.add(vMatch[1]);
  }

  const iterRegex = /\.map\(\(([^,)]+)/g;
  while ((vMatch = iterRegex.exec(bodyContent)) !== null) {
    standaloneVars.delete(vMatch[1].trim());
  }

  // Don't declare variables that might clash with keywords
  const safeVars = Array.from(standaloneVars).filter(v => !excludeVars.includes(v) && !['true', 'false', 'null', 'undefined'].includes(v));
  
  const varDeclarations = safeVars.map(v => {
    return `const ${v}: any = undefined;`; 
  }).join('\n    ');

  let mockDataString = `
  "use client";
  import React from 'react';

  export default function Page() {
    // Mock data arrays for loops
    ${lists.map(l => `const ${l} = Array(5).fill({});`).join('\n    ')}
    
    // Standalone mock variables
    ${varDeclarations}

    return (
      <React.Fragment>
        ${bodyContent}
      </React.Fragment>
    );
  }
  `;

  mockDataString = mockDataString.replace(/\bmaxlength=/gi, 'maxLength=');
  mockDataString = mockDataString.replace(/\btabindex=/gi, 'tabIndex=');
  mockDataString = mockDataString.replace(/\bautocomplete=/gi, 'autoComplete=');
  
  mockDataString = mockDataString.replace(/onClick="([^"]*)"/gi, 'onClick={() => {$1}}');
  mockDataString = mockDataString.replace(/onChange="([^"]*)"/gi, 'onChange={() => {$1}}');
  mockDataString = mockDataString.replace(/onSubmit="([^"]*)"/gi, 'onSubmit={(e) => { e.preventDefault(); $1 }}');
  mockDataString = mockDataString.replace(/onInput="([^"]*)"/gi, 'onInput={() => {$1}}');

  fs.writeFileSync(path.join(pageDir, 'page.tsx'), mockDataString);
  console.log(`Converted ${file} to ${isHome ? 'src/app/page.tsx' : `src/app/${routeName}/page.tsx`}`);
});

console.log('Conversion completed.');
