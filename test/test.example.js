/* eslint-disable no-undef */
import assert from 'assert';
import { House, MyGameObjects, Player } from './generated/example.js';
import { Mansion } from './generated/other.js';

describe('Implement README example', () => {
  it('should have correct Simple Example', () => {
    // Create an ArrayBuffer containing Player data of 'Andrin' aged 39.
    const buffer = Player.pack('Andrin', 39);
    // Parse the above ArrayBuffer
    const player = new Player(buffer);
    // Assert 'Andrin true 39'
    assert.equal(player.getName(), 'Andrin');
    assert.equal(player.hasAge(), true);
    assert.equal(player.getAge(), '39');
  });

  it('should have correct Custom Types example', () => {
    const playerBuffer = Player.pack('Andrin');
    const address = { Street: 'Mainstreet', Number: 1 };
    const houseBuffer = House.pack(playerBuffer, address);
    // Parse the buffer
    const house = new House(houseBuffer);
    // Assert 'Andrin'
    assert(house.getOwner().getName(), 'Andrin');
  });

  it('should have correct type information example', () => {
    // Create an ArrayBuffer containing Player data of 'Andrin' aged 39 including type information.
    const buffer = Player.pack('Andrin', 39, true);
    // Parse the generic MyGameObjects ArrayBuffer back to a Player
    const player = MyGameObjects(buffer);
    // Assert 'Andrin 39'
    assert.equal(player.getName(), 'Andrin');
    assert.equal(player.getAge(), '39');
  });

  it('should have correct other input file example', () => {
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
    // Assert 'Andrin 39'
    assert.equal(player.getName(), 'Andrin');
    assert.equal(player.getAge(), '39');
  });
});
