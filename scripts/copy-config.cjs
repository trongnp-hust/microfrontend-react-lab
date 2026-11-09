const fs = require('node:fs');
fs.copyFileSync('apps/shell/public/remotes.json', 'apps/shell/dist/remotes.json');
