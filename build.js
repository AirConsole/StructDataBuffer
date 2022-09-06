#!/usr/bin/env node

import yargs from 'yargs';
import fs from 'fs';
import build from './src/build.js';

const { argv } = yargs(process.argv).usage('Usage: $0 -i input.struct.json -o output.js')
  .alias('i', 'input')
  .describe('i', 'Input struct json file')
  .alias('o', 'output')
  .describe('o', 'Output path of generated Javascript module')
  .demandOption(['i', 'o'])
  .help('h')
  .alias('h', 'help');

try {
  const contents = `${fs.readFileSync(argv.i)}`;
  try {
    const input = JSON.parse(contents);
    try {
      const output = build(input);
      try {
        fs.writeFileSync(argv.o, output);
        process.exit(0);
      } catch (e) {
        console.error(`Could not write to: ${argv.o}`);
      }
    } catch (buildError) {
      console.error(buildError.message);
    }
  } catch (e) {
    console.error(`Invalid JSON: ${argv.i}`);
  }
} catch (e) {
  console.error(`Input file not found: ${argv.i}`);
}
process.exit(1);
