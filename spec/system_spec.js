import chai from 'chai';
chai.should();

import map from 'lodash/map';
import slice from 'lodash/slice';
import concat from 'lodash/concat';
import toPairs from 'lodash/toPairs';
import parseInt from 'lodash/parseInt';

import data from './data.json';

import { randomize } from '../src/';

describe('Palette randomizer', () => {

    let rom;

    let default_options = {
        randomize_dungeon: true,
        randomize_overworld: true,
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

    it('only allows valid modes', () => {
        (() => randomize([], { ...default_options, mode: 'invalid' })).should.throw(/invalid/);
    });

    it('does nothing to any data', () => {
        const input = rom.slice();

        const actual = randomize(input, { ...default_options, mode: 'none' });

        for (const [i, bytes] of entries(data.raw)) {
            slice(actual, i, i + 2).should.be.deep.equal(bytes, `at raw ${i}`);
        }
        for (const [i, bytes] of entries(data.oam)) {
            slice(actual, i + 0, i + 2).should.be.deep.equal(slice(bytes, 0, 2), `at oam ${i + 0}`);
            slice(actual, i + 3, i + 5).should.be.deep.equal(slice(bytes, 3, 5), `at oam ${i + 3}`);
        }
    });

    it('does blackout of all data', () => {
        const input = rom.slice();

        const actual = randomize(input, { ...default_options, mode: 'blackout' });

        for (const [i] of entries(data.raw)) {
            slice(actual, i, i + 2).should.be.deep.equal([0, 0], `at raw ${i}`);
        }
        for (const [i] of entries(data.oam)) {
            slice(actual, i + 0, i + 2).should.be.deep.equal([0x20, 0x40], `at oam ${i + 0}`);
            slice(actual, i + 3, i + 5).should.be.deep.equal([0x40, 0x80], `at oam ${i + 3}`);
        }
    });

    function entries(obj) {
        return map(toPairs(obj), ([offset, bytes]) => [parseInt(offset), bytes]);
    }

});
