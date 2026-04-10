const body = JSON.stringify({
  name: "a".repeat(300),
  email: `test-${Date.now()}@example.com`,
  password: "password123"
});

const req = require('http').request('http://localhost:3000/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('Response data:', data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(e);
  process.exit(1);
});
req.write(body);
req.end();
