/* eslint-disable no-undef */
import assert from 'assert';
import {
  TestStruct,
  Mixed,
  Parent,
  PropertyTypes,
  Simple,
  TYPE_ID,
} from './generated/test.js';

describe('Test functionality of generated files', () => {
  describe('Packing values', () => {
    const args = [
      new Int8Array([0]),
      1,
      new DataView(new Uint8Array([2, 2]).buffer),
      -3,
      { 4: 4 }, // '{"4":4}' has length 7
    ];
    const json = JSON.stringify({ 4: 4 });
    assert.equal(json, '{"4":4}');
    // The properties size should be 14
    const expexted0 = [
      0, 0, 0, 14 + 1, // The Int8Array is ending after properties size
      1, // Uint8 value of 1
      0, 0, 0, (14 + 1) + 2, // The DataView is ending after Int8Array
      256 - 3, // Int8 value of -3
      0, 0, 0, (14 + 1 + 2) + 7, // The JSON has length 7
      0, // the values of Int8Array
      2, 2, // The values of Uint8Array
    ];
    for (let i = 0; i < json.length; i += 1) {
      expexted0.push(json.charCodeAt(i));
    }
    const arr = Mixed.pack(...args);
    args.push(true);
    const arrTyped = Mixed.pack(...args);
    it('should generate correct array buffer', () => {
      const bytes = Array.from(new Uint8Array(arr));
      assert.equal(bytes.join(','), expexted0.join(','));
    });
    const expexted1 = JSON.parse(JSON.stringify(expexted0));
    expexted1.unshift(TYPE_ID.Mixed);
    it('should generate correct array buffer with type', () => {
      const bytes = Array.from(new Uint8Array(arrTyped));
      assert.equal(bytes.join(','), expexted1.join(','));
    });
  });
  describe('Encapsulating types', () => {
    const typedChild0 = Simple.pack(0);
    const genericChild0 = Simple.pack(1, true);
    const foreignChild0 = Simple.pack(2, true);
    const typedChild1 = Simple.pack(3);
    const foreignChild1 = Simple.pack(4, true);
    const parent0 = Parent.pack(
      typedChild0,
      genericChild0,
      new DataView(foreignChild0),
      true,
    );
    const parent1 = Parent.pack(typedChild1, parent0, new DataView(foreignChild1));
    const result1 = new Parent(parent1);
    it('should have all the right children', () => {
      assert.equal(result1.typeId(), TYPE_ID.Parent);
      assert.equal(result1.getTypedChild().typeId(), TYPE_ID.Simple);
      assert.equal(result1.getTypedChild().getA(), 3);
      assert.equal(result1.getGenericChild().typeId(), TYPE_ID.Parent);
      assert.equal(TestStruct(result1.getForeignChild()).typeId(), TYPE_ID.Simple);
      assert.equal(TestStruct(result1.getForeignChild()).getA(), 4);
      const result0 = result1.getGenericChild();
      assert.equal(result0.typeId(), TYPE_ID.Parent);
      assert.equal(result0.getTypedChild().typeId(), TYPE_ID.Simple);
      assert.equal(result0.getTypedChild().getA(), 0);
      assert.equal(result0.getGenericChild().typeId(), TYPE_ID.Simple);
      assert.equal(result0.getGenericChild().getA(), 1);
      assert.equal(TestStruct(result0.getForeignChild()).typeId(), TYPE_ID.Simple);
      assert.equal(TestStruct(result0.getForeignChild()).getA(), 2);
    });
  });
  describe('Packing and Unpacking', () => {
    const arr = PropertyTypes.pack(
      255,
      65535,
      4294967295,
      4294967296n,
      -128,
      -32768,
      -2147483648,
      -2147483649n,
      0.5,
      -0.5,
      'Hello World',
      { a: 1 },
      new DataView(new Uint8Array([2, 2]).buffer),
      new Int8Array([-128, 127]),
      new Uint8Array([0, 255]),
      true,
    );
    const flatArr = (x) => JSON.stringify(Array.from(x));
    const numbers = new TestStruct(arr);
    it('should serialize and parse correctly', () => {
      assert.equal(numbers.getUint8(), 255);
      assert.equal(numbers.getUint16(), 65535);
      assert.equal(numbers.getUint32(), 4294967295);
      assert.equal(numbers.getBigUint64(), 4294967296n);
      assert.equal(numbers.getInt8(), -128);
      assert.equal(numbers.getInt16(), -32768);
      assert.equal(numbers.getInt32(), -2147483648);
      assert.equal(numbers.getBigInt64(), -2147483649n);
      assert.equal(numbers.getFloat32(), 0.5);
      assert.equal(numbers.getFloat64(), -0.5);
      assert.equal(numbers.getString(), 'Hello World');
      assert.equal(JSON.stringify(numbers.getJSON()), JSON.stringify({ a: 1 }));
      assert.equal(numbers.getDataView().byteLength, 2);
      assert.equal(numbers.getDataView().getUint8(0), 2);
      assert.equal(numbers.getDataView().getUint8(1), 2);
      assert.equal(flatArr(numbers.getInt8Array()), flatArr([-128, 127]));
      assert.equal(flatArr(numbers.getUint8Array()), flatArr([0, 255]));
    });
  });
});
