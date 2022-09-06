# StructDataBuffer
StructDataBuffers adds structure to ArrayBuffers.

The structure defined in a JSON file.
This JSON file is then compiled into a Javascript ES6 module.

This module can serialize structured data into an ArrayBuffer and
parse ArrayBuffers back into structured data.

## Files to follow while you read this:
* [example.struct.json](test/generated/example.struct.json): The definition of the StructDataBuffers
* [example.js](test/generated/example.js): The generated javascript file from the definition
* [test.example.js](test/test.example.js): The `javascript` code examples in this file

## Simple Example

Imagine you want to create a game that has Players with names and ages.

You would create a file called [`example.struct.json`](test/generated/example.struct.json):
```json
{
  "name": "MyGameObjects",
  "doc": "Some structs for a game",
  "structs": [
    {
      "name": "Player",
      "doc": "A player inside a world",
      "properties": [
        {
          "name": "Name",
          "doc": "The name of the player",
          "type": "string"
        },
        {
          "name": "Age",
          "doc": "The age of the player",
          "type": "Uint8"
        }
      ]
    }
  ]
}
```
You then would compile this file to javascript by calling:
```shell
node build.js --input example.struct.json --output example.js
```
This would generate all Classes needed for you:
```javascript
import { Player } from 'example.js'

// Create an ArrayBuffer containing Player data of 'Andrin' aged 39.
const buffer = Player.pack('Andrin', 39);

// Parse the above ArrayBuffer
const player = new Player(buffer);

// will print 'Andrin 39'
console.log(player.getName(), player.getAge());
```

## Property Types:
### Standard types
`Uint8`, `Uint16`, `Uint32`, `BigUint64`, `Int8`, `Int16`, `Int32`, `BigInt64`, `Float32`, `Float64`, `string`, `JSON`, `DataView`, `Int8Array`, `Uint8Array`

Note: Arrays with elements that have size greater than 1 byte are not supported. Use DataViews instead.

### Custom Types
Any type defined in the same input file can be referenced.

Here is an example where we add a `House` to our [`example.struct.json`](test/generated/example.struct.json) input file with a custom type `Player` that we defined:
```json
{
  "name": "MyGameObjects",
  "doc": "Some structs for a game",
  "structs": [
    
    ...
    
    {
      "name": "House",
      "doc": "A house in the world",
      "properties": [
        {
          "name": "Owner",
          "doc": "Who owns the house",
          "type": "Player"
        },
        {
          "name": "Address",
          "doc": "A JSON representing the address of the house",
          "type": "JSON"
        }
      ]
    }
  ]
}
```
Now you can create a House that is owned by a Player:
```javascript
const playerBuffer = Player.pack('Andrin', 39);
const address = { Street: 'Mainstreet', Number: 1 };
const houseBuffer = House.pack(playerBuffer, address);

// Parse the buffer
const house = new House(houseBuffer);
// will print 'Andrin'
console.log(house.getOwner().getName());
```
## Adding type information to ArrayBuffers
You can  call `pack()` with an additional parameter `includeType = true` and then you can parse it by calling the `MyGameObjects(arr)` function instead of calling the `new Player()` constructor, which will use the additional information to return the right type of Object:
```javascript
// Create an ArrayBuffer containing Player data of 'Andrin' aged 39 including type information.
const buffer = Player.pack('Andrin', 39, true);

// Parse the generic MyGameObjects ArrayBuffer back to a Player
const player = MyGameObjects(buffer);

// will print 'Andrin 39'
console.log(player.getName(), player.getAge());
```
## Using Custom types defined in another input file
In order to use a custom type from a StructDataBuffer defined in another input file,
you have to create a property of type `DataView` in your struct.

Here is an example [`other.struct.json`](test/generated/other.struct.json):
```json
{
  "name": "OtherGameObjects",
  "doc": "Some structs for another game",
  "structs": [
    {
      "name": "Mansion",
      "doc": "A mansion in another world.",
      "properties": [
        {
          "name": "Player",
          "doc": "A player from another input file",
          "type": "DataView"
        }
      ]
    }
  ]
}
```
An here is how you would use it:
```javascript
// Create an ArrayBuffer containing Player data of 'Andrin' aged 39
const playerBuffer = Player.pack('Andrin', 39);
// Convert the playerBuffer to a dataview
const playerDataView = new DataView(playerBuffer);
// Create a Mansion with the playerDataView
const mansionBuffer = Mansion.pack(playerDataView);

// Parse the mansion buffer
const mansion = new Mansion(mansionBuffer);
const dataView = mansion.getPlayer();
const player = new Player(dataView);

// will print 'Andrin 39'
console.log(player.getName(), player.getAge());
```
---
Made in Zurich, Switzerland with :heart:
