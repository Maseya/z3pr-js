import chai from 'chai';
chai.should();

import map from 'lodash/map';
import slice from 'lodash/slice';
import concat from 'lodash/concat';
import toPairs from 'lodash/toPairs';
import parseInt from 'lodash/parseInt';

import base from './base.json';
import negative from './negative.json';
import grayscale from './grayscale.json';
import maseya from './maseya.json';

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
        for (let [offset, bytes] of concat(toPairs(base.raw), toPairs(base.oam))) {
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

        for (const [i, bytes] of entries(base.raw)) {
            slice(actual, i, i + 2).should.be.deep.equal(bytes, `at raw ${i}`);
        }
        for (const [i, bytes] of entries(base.oam)) {
            slice(actual, i + 0, i + 2).should.be.deep.equal(slice(bytes, 0, 2), `at oam ${i + 0}`);
            slice(actual, i + 3, i + 5).should.be.deep.equal(slice(bytes, 3, 5), `at oam ${i + 3}`);
        }
    });

    it('does blackout of all data', () => {
        const input = rom.slice();

        const actual = randomize(input, { ...default_options, mode: 'blackout' });

        for (const [i] of entries(base.raw)) {
            slice(actual, i, i + 2).should.be.deep.equal([0, 0], `at raw ${i}`);
        }
        for (const [i] of entries(base.oam)) {
            slice(actual, i + 0, i + 2).should.be.deep.equal([0x20, 0x40], `at oam ${i + 0}`);
            slice(actual, i + 3, i + 5).should.be.deep.equal([0x40, 0x80], `at oam ${i + 3}`);
        }
    });

    it('does negative of all data', () => {
        const input = rom.slice();

        const actual = randomize(input, { ...default_options, mode: 'negative' });

        for (const [i] of entries(base.raw)) {
            const expected = negative.raw[i];
            slice(actual, i, i + 2).should.be.deep.equal(expected, `at raw ${i}`);
        }
        for (const [i] of entries(base.oam)) {
            const expected = negative.oam[i];
            slice(actual, i + 0, i + 2).should.be.deep.equal(slice(expected, 0, 2), `at oam ${i + 0}`);
            slice(actual, i + 3, i + 5).should.be.deep.equal(slice(expected, 3, 5), `at oam ${i + 3}`);
        }
    });

    it('does grayscale of all data', () => {
        const input = rom.slice();

        const actual = randomize(input, { ...default_options, mode: 'grayscale' });

        for (const [i] of entries(base.raw)) {
            const expected = grayscale.raw[i];
            slice(actual, i, i + 2).should.be.deep.equal(expected, `at raw ${i}`);
        }
        for (const [i] of entries(base.oam)) {
            const expected = grayscale.oam[i];
            slice(actual, i + 0, i + 2).should.be.deep.equal(slice(expected, 0, 2), `at oam ${i + 0}`);
            slice(actual, i + 3, i + 5).should.be.deep.equal(slice(expected, 3, 5), `at oam ${i + 3}`);
        }
    });

    it('does maseya blend of all data', () => {
        const input = rom.slice();

        const actual = randomize(input, { ...default_options, mode: 'maseya' }, next_color(maseya.random));

        for (const [i] of entries(base.raw)) {
            const expected = maseya.raw[i];
            slice(actual, i, i + 2).should.be.deep.equal(expected, `at raw ${i}`);
        }
        for (const [i] of entries(base.oam)) {
            const expected = maseya.oam[i];
            slice(actual, i + 0, i + 2).should.be.deep.equal(slice(expected, 0, 2), `at oam ${i + 0}`);
            slice(actual, i + 3, i + 5).should.be.deep.equal(slice(expected, 3, 5), `at oam ${i + 3}`);
        }
    });

    function next_color(source) {
        let i = 0;
        return function () {
            i %= source.length;
            return source[i++];
        };
    }

    function entries(obj) {
        return map(toPairs(obj), ([offset, bytes]) => [parseInt(offset), bytes]);
    }

});
