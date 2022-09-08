/**
 * WARNING: THIS IS AN AUTOGENERATED FILE, DO NOT EDIT!
 * To update this file use the StructDataBuffer tool on:
 * https://github.com/AirConsole/StructDataBuffer
*/

/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-bitwise */
/* eslint-disable no-use-before-define */

export class NormalStruct {
  /**
   * Creates a NormalStruct instance to access the different properties.
   * @param {ArrayBuffer|DataView|TypedArray} data The data array created by calling
   *   NormalStruct.pack(..., includeType=false);
   */
  constructor(data) {
    if (!ArrayBuffer.isView(data)) {
      this.view = new DataView(data);
    } else if (data instanceof DataView) {
      this.view = data;
    } else {
      this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    }
  }

  /**
   * Returns the type id of this struct.
   * Can be used for example in switch statements together with TYPES.
   * @returns {number}
   */
  typeId() {
    return 0;
  }

  /**
   * Creates an ArrayBuffer including all the values
   * @param {string} propString
   * @param {number} propTestNumber
   * @param {number} propOtherNumber
   * @param {Uint8Array|undefined} propArrayData
   * @param {boolean} [includeType] If true, the returned ArrayBuffer can only be parsed by
   *   PerformanceTest(), if false, it can only be parsed by calling new NormalStruct();
   *   Default: false
   * @returns {ArrayBuffer}
   */
  static pack(
    propString,
    propTestNumber,
    propOtherNumber,
    propArrayData,
    includeType,
  ) {
    const typeOffset = includeType ? 1 : 0;
    let len = typeOffset + 14;
    let pointerOffset = 14;
    const uint8ArrayString = new TextEncoder().encode(propString);
    len += uint8ArrayString.length;
    let uint8ArrayArrayData;
    if (propArrayData !== undefined) {
      uint8ArrayArrayData = propArrayData;
      len += uint8ArrayArrayData.length;
    }
    const buffer = new ArrayBuffer(len);
    const view = new DataView(buffer, typeOffset);
    const uint8Array = new Uint8Array(buffer);
    if (includeType) {
      uint8Array[0] = 0;
    }
    uint8Array.set(uint8ArrayString, pointerOffset + typeOffset);
    pointerOffset += uint8ArrayString.byteLength;
    view.setUint32(0, pointerOffset);
    view.setUint32(4, propTestNumber);
    view.setUint8(8, propOtherNumber);
    if (propArrayData !== undefined) {
      view.setUint8(13, view.getUint8(13) | 1);
      uint8Array.set(uint8ArrayArrayData, pointerOffset + typeOffset);
      pointerOffset += uint8ArrayArrayData.byteLength;
    }
    view.setUint32(9, pointerOffset);
    return buffer;
  }

  /**
   * @returns {string}
   */
  getString() {
    const offset = 14;
    const len = this.view.getUint32(0) - offset;
    const dataBuffer = new Uint8Array(this.view.buffer, offset + this.view.byteOffset, len);
    return new TextDecoder().decode(dataBuffer);
  }

  /**
   * @returns {number}
   */
  getTestNumber() {
    return this.view.getUint32(4);
  }

  /**
   * @returns {number}
   */
  getOtherNumber() {
    return this.view.getUint8(8);
  }

  /**
   * Checks if ArrayData is set
   * @returns {boolean}
   */
  hasArrayData() {
    return !!(this.view.getUint8(13) & 1);
  }

  /**
   * @returns {Uint8Array|undefined}
   */
  getArrayData() {
    if (this.hasArrayData()) {
      const offset = this.view.getUint32(0);
      const len = this.view.getUint32(9) - offset;
      return new Uint8Array(this.view.buffer, offset + this.view.byteOffset, len);
    }
    return undefined;
  }
}

/**
 * A map between struct names and their type id.
 * Can for example be used for high performance code in switches.
 * @type {{number}}
 */
export const TYPE_ID = {
  NormalStruct: 0,
};

/**
 * Converts an ArrayBuffer into one of the PerformanceTest structs.
 * @param {ArrayBuffer|DataView|TypedArray} data
 * @returns {NormalStruct}
 */
export function PerformanceTest(data) {
  let view;
  if (!ArrayBuffer.isView(data)) {
    view = new DataView(data);
  } else if (data instanceof DataView) {
    view = data;
  } else {
    view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  }
  const dataView = new DataView(view.buffer, view.byteOffset + 1, view.byteLength - 1);
  switch (view.getUint8(0)) {
    case TYPE_ID.NormalStruct:
      return new NormalStruct(dataView);
    default:
      throw Error('Unknown struct TYPE_ID');
  }
}