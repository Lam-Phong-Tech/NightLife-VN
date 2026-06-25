const { execSync } = require('child_process');

try {
  console.log('Running tsc...');
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('tsc passed!');
} catch (error) {
  const output = error.stdout.toString();
  console.log('tsc failed with errors. Parsing...');
  const errors = output.split('\n').filter(line => line.includes('error TS'));
  const uniqueErrors = [...new Set(errors.map(e => e.split('error TS')[1].replace(/^[0-9]+: /, '')))];
  console.log(uniqueErrors.slice(0, 20).join('\n'));
}
