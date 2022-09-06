#!/usr/bin/env node

import fs from 'fs';
import build from '../src/build.js';

fs.readdirSync('./test/generated').forEach((filename) => {
  const path = `./test/generated/${filename}`;
  if (filename.endsWith('.struct.json')) {
    const input = JSON.parse(`${fs.readFileSync(path)}`);
    const output = build(input);
    fs.writeFileSync(path.replace('.struct.json', '.js'), output);
  } else {
    fs.unlinkSync(path);
  }
});
console.log('New test results generated. Makes sure they are correct!');
