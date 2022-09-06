/* eslint-disable no-undef */
import assert from 'assert';
import fs from 'fs';
import build from '../src/build.js';

describe('Test Generated files are equal', () => {
  fs.readdirSync('./test/generated').forEach((filename) => {
    describe(filename, () => {
      const path = `./test/generated/${filename}`;
      if (filename.endsWith('.struct.json')) {
        const input = JSON.parse(`${fs.readFileSync(path)}`);
        const generated = build(input);
        const expected = `${fs.readFileSync(path.replace('.struct.json', '.js'))}`;
        it('should be the same', () => {
          assert.equal(generated, expected);
        });
      }
    });
  });
});
