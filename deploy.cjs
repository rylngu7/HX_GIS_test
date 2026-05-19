const { spawn } = require('child_process');

const surge = spawn('surge', ['dist', '--domain', 'gis-remote-sensing-tool.surge.sh']);

surge.stdin.write('test@example.com\n');
surge.stdin.write('test123456\n');
surge.stdin.end();

surge.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

surge.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

surge.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});