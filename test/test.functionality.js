/* eslint-disable no-undef */
import assert from 'assert';
import {
  TestStruct,
  Mixed,
  Parent,
  PropertyTypes,
  Simple,
  TYPE_ID, Optional, Align, UnalignedParent, TestJSON,
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
      new Int16Array([-32768, 32767]),
      new Uint16Array([0, 65535]),
      new Int32Array([-2147483648, 2147483647]),
      new Uint32Array([0, 4294967295]),
      new BigInt64Array([-1n, 1n]),
      new BigUint64Array([0n, 1n]),
      new Float32Array([-0.5, 0.5]),
      new Float64Array([-0.5, 0.5]),
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
      assert.equal(flatArr(numbers.getInt8Array()), flatArr([-128, 127]));
      assert.equal(flatArr(numbers.getUint8Array()), flatArr([0, 255]));
      assert.equal(flatArr(numbers.getInt16Array()), flatArr([-32768, 32767]));
      assert.equal(flatArr(numbers.getUint16Array()), flatArr([0, 65535]));
      assert.equal(flatArr(numbers.getInt32Array()), flatArr([-2147483648, 2147483647]));
      assert.equal(flatArr(numbers.getUint32Array()), flatArr([0, 4294967295]));
      assert.equal(flatArr(numbers.getFloat32Array()), flatArr([-0.5, 0.5]));
      assert.equal(flatArr(numbers.getFloat64Array()), flatArr([-0.5, 0.5]));
      assert.equal(numbers.getBigInt64Array().length, 2);
      assert.equal(numbers.getBigInt64Array()[0], -1n);
      assert.equal(numbers.getBigInt64Array()[1], 1n);
      assert.equal(numbers.getBigUint64Array().length, 2);
      assert.equal(numbers.getBigUint64Array()[0], 0n);
      assert.equal(numbers.getBigUint64Array()[1], 1n);
    });
  });
  describe('Optional properties', () => {
    it('should handle optional properties correct', () => {
      const optionalArr = Optional.pack(
        undefined,
        1,
        'hi',
        2,
        'hello',
        undefined,
        { a: 3 },
        undefined,
        new Int8Array([4, 5]),
        undefined,
        0.5,
        true,
        false,
      );
      const optional = new Optional(optionalArr);
      assert.equal(optional.hasOptionalUint8(), false);
      assert.equal(optional.getOptionalUint8(), undefined);
      assert.equal(optional.getRequiredUint8(), 1);
      assert.equal(optional.hasOptionalString(), true);
      assert.equal(optional.getOptionalString(), 'hi');
      assert.equal(optional.hasOptionalUint16(), true);
      assert.equal(optional.getOptionalUint16(), 2);
      assert.equal(optional.getRequiredString(), 'hello');
      assert.equal(optional.hasOptionalDataView(), false);
      assert.equal(optional.getOptionalDataView(), undefined);
      assert.equal(optional.hasOptionalJSON(), true);
      assert.equal(JSON.stringify(optional.getOptionalJSON()), JSON.stringify({ a: 3 }));
      assert.equal(optional.hasOptionalUint8Array(), false);
      assert.equal(optional.getOptionalUint8Array(), undefined);
      assert.equal(optional.hasOptionalInt8Array(), true);
      assert.equal(optional.getOptionalInt8Array().length, 2);
      assert.equal(optional.getOptionalInt8Array()[0], 4);
      assert.equal(optional.getOptionalInt8Array()[1], 5);
      assert.equal(optional.hasOptionalSimple(), false);
      assert.equal(optional.getOptionalSimple(), undefined);
      assert.equal(optional.hasOptionalFloat32(), true);
      assert.equal(optional.getOptionalFloat32(), 0.5);
      assert.equal(optional.getRequiredBoolean(), true);
      assert.equal(optional.hasOptionalBoolean(), true);
      assert.equal(optional.getOptionalBoolean(), false);
    });
  });
  describe('Padding pointers', () => {
    const arrEq = (a, b) => {
      assert.equal(JSON.stringify(Array.from(a)), JSON.stringify(Array.from(b)));
    };
    it('should handle pad pointers correctly', () => {
      const arr1 = Align.pack(
        'a',
        new Uint32Array([1, 2, 3]),
        'b', // Screw up alignment
        new Uint32Array([4, 5, 6]),
        undefined,
        new DataView(new Uint32Array([6, 7, 8]).buffer),
      );
      const arr2 = Align.pack(
        'AA', // Two letters so we can make sure it shifted compared to arr1
        new Uint32Array([1, 2, 3]),
        'b', // Screw up alignment
        new Uint32Array([4, 5, 6]),
        arr1,
      );
      const aligned1 = new Align(arr1);
      const aligned2 = new Align(arr2);
      assert.equal(aligned1.getGap1(), 'a');
      assert.equal(aligned2.getGap1(), 'AA');
      arrEq(aligned1.getAligned(), [1, 2, 3]);
      arrEq(aligned2.getAligned(), [1, 2, 3]);
      arrEq(aligned2.getChild().getAligned(), [1, 2, 3]);
      assert.equal(aligned1.getGap2(), 'b');
      assert.equal(aligned2.getGap2(), 'b');
      arrEq(aligned1.getUnaligned(), [4, 5, 6]);
      arrEq(aligned2.getUnaligned(), [4, 5, 6]);
      arrEq(aligned2.getChild().getUnaligned(), [4, 5, 6]);
      arrEq(new Uint32Array(
        aligned1.getDataView().buffer,
        aligned1.getDataView().byteOffset,
        aligned1.getDataView().byteLength / 4,
      ), [6, 7, 8]);
      arrEq(new Uint32Array(
        aligned2.getChild().getDataView().buffer,
        aligned2.getChild().getDataView().byteOffset,
        aligned2.getChild().getDataView().byteLength / 4,
      ), [6, 7, 8]);
      assert.equal(aligned1.getAligned().buffer, arr1);
      assert.equal(aligned2.getAligned().buffer, arr2);
      assert.equal(aligned2.getChild().view.buffer, arr2);
      assert.equal(aligned1.getUnaligned().buffer !== arr1
                   || aligned2.getUnaligned().buffer !== arr2, true);
    });
  });
  describe('Unaligned Parent', () => {
    const arrEq = (a, b) => {
      assert.equal(JSON.stringify(Array.from(a)), JSON.stringify(Array.from(b)));
    };
    it('should handle unaligned children that are aligned', () => {
      const childArr = Align.pack(
        'a',
        new Uint32Array([1, 2, 3]),
        'b',
        new Uint32Array([4, 5, 6]),
      );
      const arr = UnalignedParent.pack(childArr, true);
      const parent = TestStruct(arr);
      const child = parent.getChild();
      arrEq(child.getAligned(), [1, 2, 3]);
    });
  });
  describe('JSON', () => {
    it('Undefined JSON should be fine', () => {
      const arr = TestJSON.pack(undefined, true);
      const test = TestStruct(arr);
      assert.equal(test.getData(), undefined);
    });
  });
});
