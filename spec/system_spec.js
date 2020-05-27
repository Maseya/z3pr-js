import chai from 'chai';
chai.should();

import map from 'lodash/map';
import slice from 'lodash/slice';
import concat from 'lodash/concat';
import keys from 'lodash/keys';
import toPairs from 'lodash/toPairs';
import parseInt from 'lodash/parseInt';

import data from './data.json';

import { randomize } from '../src/';

describe('Palette randomizer', () => {

    let rom;

    let default_options = {
        randomize_dungeon: true,
        randomize_overworld: true,
        randomize_hud: true,
        randomize_link_sprite: true,
        randomize_sword: true,
        randomize_shield: true,
    };

    before(() => {
        rom = new Uint8Array(0x200000);
        for (let [offset, bytes] of concat(toPairs(data.raw), toPairs(data.oam))) {
            for (let byte of bytes) {
                rom[offset++] = byte;
            }
        }
    });

    it('does blackout of all data', () => {
        const input = rom.slice();

        const actual = randomize(input, { ...default_options, mode: 'blackout' });

        // Bit operation for string -> int
        for (const i of offsets(data.raw)) {
            slice(actual, i, i + 2).should.be.deep.equal([0, 0], `at raw ${i}`);
        }
        for (const i of offsets(data.oam)) {
            slice(actual, i + 0, i + 2).should.be.deep.equal([0x20, 0x40], `at oam ${i + 0}`);
            slice(actual, i + 3, i + 5).should.be.deep.equal([0x40, 0x80], `at oam ${i + 3}`);
        }
    });

    function offsets(obj) {
        return map(keys(obj), parseInt);
    }

});
