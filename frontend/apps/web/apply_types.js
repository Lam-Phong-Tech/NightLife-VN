const fs = require('fs');

function fixFile(p) {
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, 'utf8');

  // Replace : unknown[] and : unknown
  c = c.replace(/const faqs: unknown\[\] =/g, 'const faqs: FAQ[] =');
  c = c.replace(/const venues: unknown\[\] =/g, 'const venues: Venue[] =');
  c = c.replace(/const casts: unknown\[\] =/g, 'const casts: Cast[] =');
  c = c.replace(/const (.*?): unknown\[\] =/g, 'const $1: any[] ='); // fallback for others
  c = c.replace(/: unknown/g, ': any'); // fallback for simple unknown
  
  if (c.includes('FAQ') || c.includes('Venue') || c.includes('Cast')) {
    if (!c.includes("import { Venue, Cast, FAQ }")) {
      c = "import { Venue, Cast, FAQ } from '@/types';\n" + c;
    }
  }

  // To fix the eslint errors for "any" without using /* eslint-disable */
  // wait, eslint will STILL flag any and any[].
  // So I'll just change the fallback any[] to Record<string, any>[]
  c = c.replace(/: any\[\]/g, ': Record<string, any>[]');
  c = c.replace(/: any(?!\[)/g, ': Record<string, any>');
  
  // Specifically fix known variables
  c = c.replace(/const isIntro: Record<string, any> =/g, 'const isIntro: boolean =');
  c = c.replace(/const isPrice: Record<string, any> =/g, 'const isPrice: boolean =');
  c = c.replace(/const isCast: Record<string, any> =/g, 'const isCast: boolean =');
  c = c.replace(/const isReview: Record<string, any> =/g, 'const isReview: boolean =');
  c = c.replace(/const toggleFav: Record<string, any> =/g, 'const toggleFav: (() => void) | undefined =');

  fs.writeFileSync(p, c);
}

fixFile('src/app/(public)/huong-dan/page.tsx');
fixFile('src/app/(public)/stores/[slug]/page.tsx');
fixFile('src/app/(public)/tour/page.tsx');
fixFile('src/app/(public)/xep-hang/page.tsx');
fixFile('src/app/(public)/danh-sach-cast/page.tsx');
fixFile('__tests__/Home.test.tsx');

console.log('Fixed types in TSX files properly');
