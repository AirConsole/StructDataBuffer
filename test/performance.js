#!/usr/bin/env node

import { NormalStruct } from './generated/performance.js';

function test(f, arrayData) {
  const start = Date.now();
  let last;
  for (let i = 0; i < 1000000; i += 1) {
    last = f(i, arrayData);
  }
  return [Date.now() - start, last + 1];
}

const dataArray = new Uint8Array([1, 2, 3, 4, 5, 6]);
const jsonArray = [1, 2, 3, 4, 5, 6];

function testStructDataBuffer(i) {
  const arr = NormalStruct.pack('test', i, 0, dataArray);
  const normal = new NormalStruct(arr);
  return normal.getTestNumber();
}

function testJSON(i) {
  const str = JSON.stringify({
    String: 'test', TestNumber: i, OtherNumber: 0, ArrayData: jsonArray,
  });
  const normal = JSON.parse(str);
  return normal.TestNumber;
}

const resultStructDataBuffer = test(testStructDataBuffer);
const resultJSON = test(testJSON);
console.log(`StructDataBuffer took ${resultStructDataBuffer[0]}ms to execute ${resultStructDataBuffer[1]} iterations`);
console.log(`JSON took ${resultJSON[0]}ms to execute ${resultJSON[1]} iterations`);
console.log(`StructDataBuffer speed compared to JSON: ${resultJSON[0] / resultStructDataBuffer[0]}x`);
