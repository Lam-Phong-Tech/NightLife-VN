const fs = require('fs');

const testFile = 'd:/laragon/www/NightLife-VN/backend/src/nightlife-data/nightlife-data.service.spec.ts';
let content = fs.readFileSync(testFile, 'utf8');

content = content.replace(/id: 'booking-5542',/g, "id: 'booking-5542',\n        bookingCode: 'BK-5542',");
content = content.replace(/bookingId: 'booking-1',/g, "bookingId: 'booking-1',\n          bookingCode: 'BK-BOOKING-',");
content = content.replace(/id: '550e8400-e29b-41d4-a716-446655440000',/g, "id: '550e8400-e29b-41d4-a716-446655440000',\n      bookingCode: 'BK-550E8400',");

fs.writeFileSync(testFile, content);
console.log('Fixed backend test');
