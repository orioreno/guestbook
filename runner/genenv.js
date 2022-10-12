require('dotenv').config();

function createEnv(path, values) {
  let text = '';
  for (key in values) {
    text += key + '=' + values[key] + "\n";
  }

  const fs = require('fs');
  fs.writeFile(path, text, function (err) {
    if (err) throw err;
    console.log(path + ' created!');
  })
}


// GET IP ADDRESS
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const ips = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!ips[name]) {
              ips[name] = [];
            }
            ips[name].push(net.address);
        }
    }
}

// CREATE .env AT API
createEnv('../api/.env', {
  'PORT': process.env.API_PORT || 5001,
  'DBDIR': process.env.DB_DIRECTORY || 'db',
  'DBNAME': process.env.DB_NAME || 'guestbook.db'
});


// CREATE .env AT SITE
createEnv('../site/.env', {
  'API_PORT': process.env.API_PORT || 5001,
  'SITE_PORT': process.env.SITE_PORT || 5000
});

