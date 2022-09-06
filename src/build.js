import ejs from 'ejs';
import fs from 'fs';

const alphaNum = /^[a-zA-Z][a-zA-Z0-9]*$/;

const PROPERTY_TYPES = {
  Uint8: { size: 1, doc: 'number' },
  Uint16: { size: 2, doc: 'number' },
  Uint32: { size: 4, doc: 'number' },
  BigUint64: { size: 8, doc: 'BigInt' },
  Int8: { size: 1, doc: 'number' },
  Int16: { size: 2, doc: 'number' },
  Int32: { size: 4, doc: 'number' },
  BigInt64: { size: 8, doc: 'BigInt' },
  Float32: { size: 4, doc: 'number' },
  Float64: { size: 8, doc: 'number' },
  string: { doc: 'string', pointer: true },
  JSON: { doc: 'Object|Array|string|number|boolean', pointer: true },
  DataView: { doc: 'DataView', pointer: true },
  Int8Array: { doc: 'Int8Array', pointer: true },
  Uint8Array: { doc: 'Uint8Array', pointer: true },
  // Arrays with element size greater than a single byte (e.g. Uint32Array)
  // are NOT supported. We recommend to use DataView for these arrays instead.
  // The reason is that we can not initialize those arrays from an unaligned
  // ArrayBuffer. (e.g. a Uint32Array needs to begin at a multiple of 4);
  // It could be solved by adding padding to all these arrays and an 8 byte
  // padding to DataView (so you can encapsulate other foreign
  // struct types), but we prefer to have compact ArrayBuffers.
};

function isAlphaNum(str) {
  return str && alphaNum.test(str);
}

function execError(err) {
  throw Error(err);
}

function createTemplateData(input) {
  const { structs } = input;
  if (!isAlphaNum(input.name)) {
    execError(`Input "name" must be alphanumeric: ${input.name}`);
  }
  if (!structs) {
    execError('Input has no structs property');
  }
  const propertyTypes = JSON.parse(JSON.stringify(PROPERTY_TYPES));
  const structNames = [];
  for (let i = 0; i < structs.length; i += 1) {
    if (i > 255) {
      execError('The maximum amount of structs is 256');
    }
    const struct = structs[i];
    if (!isAlphaNum(struct.name)) {
      execError(`structs.name must be alphanumeric: ${struct.name}`);
    }
    const { name } = struct;
    propertyTypes[name] = {
      doc: name,
      pointer: true,
      isArrayBuffer: true,
    };
    if (name === input.name) {
      execError(`structs.name can't be equal to name: ${struct.name}`);
    }
    if (structNames.indexOf(name) !== -1) {
      execError(`structs.name need to be unique: ${struct.name}`);
    }
    structNames.push(name);
  }
  propertyTypes[input.name] = {
    pointer: true,
    isArrayBuffer: true,
  };
  const template = {
    name: input.name,
    structs: [],
    propertyTypes,
  };
  for (let i = 0; i < structs.length; i += 1) {
    const struct = structs[i];
    const entry = JSON.parse(JSON.stringify(struct));
    let offset = 0;
    let lastPointer = -1;
    const propertyNames = [];
    if (entry.properties) {
      for (let p = 0; p < entry.properties.length; p += 1) {
        const prop = entry.properties[p];
        if (!isAlphaNum(prop.name)) {
          execError(`structs.property.name must be alphanumeric: ${struct.name}.${prop.name}`);
        }
        const propType = propertyTypes[prop.type];
        if (!propType) {
          execError(`Unknown Property type in ${struct.name}.${prop.name}: ${prop.type}`);
        }
        prop.offset = offset;
        if (prop.doc) {
          prop.doc = ` ${prop.doc}`;
        }
        if (propType.bytesPerElement !== undefined) {
          prop.bytesPerElement = propType.bytesPerElement;
        }
        if (propType.pointer) {
          prop.pointer = lastPointer;
          lastPointer = p;
          prop.size = 4;
        } else {
          prop.size = propType.size;
        }
        offset += prop.size;
        if (propertyNames.indexOf(prop.name) !== -1) {
          execError(`Property name needs to be unique: ${struct.name}.${prop.name}`);
        }
        propertyNames.push(prop.name);
      }
    }
    entry.hasPointers = lastPointer !== -1;
    entry.propertiesSize = offset;
    entry.propertyNames = propertyNames;

    entry.id = i;
    template.structs[struct.name] = entry;
  }
  propertyTypes[input.name].doc = structNames.join('|');
  return template;
}

export default function build(input) {
  const structure = createTemplateData(input);
  let template = `${fs.readFileSync('src/template.ejs')}`.trim();
  if (!template.startsWith('<script>') || !template.endsWith('</script>')) {
    execError('Invalid template: Needs to start with <script></script>');
  }
  template = `${template.substring('<script>'.length, template.length - '</script>'.length).trim()}\n`;
  return ejs.render(template, structure);
}
