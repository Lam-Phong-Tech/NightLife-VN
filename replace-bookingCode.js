const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const files = walkSync('d:/laragon/www/NightLife-VN/frontend/apps/web/src/app');

files.filter(f => f.endsWith('.tsx')).forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Remove the const bookingCode = ... declarations
  content = content.replace(/const bookingCode = \(booking: [^)]+\) =>\s*`#?BK-\$\{booking\.id\.slice\(0, 8\)\.toUpperCase\(\)\}`;?\r?\n?/g, '');
  
  // Replace bookingCode(booking) with booking.bookingCode
  // Also handle selectedBooking or chatBooking if any
  content = content.replace(/bookingCode\(([^)]+)\)/g, '$1.bookingCode');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
