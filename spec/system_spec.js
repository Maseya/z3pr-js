import with_cases from './with_cases';
import chai from 'chai';
chai.should();

import map from 'lodash/map';
import slice from 'lodash/slice';
import concat from 'lodash/concat';
import keys from 'lodash/keys';
import toPairs from 'lodash/toPairs';
import parseInt from 'lodash/parseInt';

import base from './data/base.json';
import negative from './data/negative.json';
import grayscale from './data/grayscale.json';
import maseya from './data/maseya.json';

import color_f from '../src/color_f';

import { randomize } from '../src/';

describe('Palette randomizer', () => {

    let rom;

    before(() => {
        rom = new Uint8Array(0x200000);
        for (const subset in base) {
            const data = base[subset];
            for (let [offset, bytes] of concat(toPairs(data.raw), toPairs(data.oam))) {
                for (let byte of bytes) {
                    rom[offset++] = byte;
                }
            }
        }
    });

    it('only allows valid modes', () => {
        (() => randomize([], { mode: 'invalid' })).should.throw(/invalid/);
    });

    context('with none mode', () => {

        with_cases('dungeon', 'sword', 'shield', 'overworld',
        (subset) => it(`does nothing to ${subset} data`, () => {
            const input = rom.slice();
            const option = `randomize_${subset}`;
            const data = base[subset];

            const actual = randomize(input, { mode: 'none', [option]: true });

            should_have_expected_data(actual, data, i => data.raw[i], i => data.oam[i]);
        }));

    });

    context('with blackout mode', () => {

        with_cases('dungeon', 'sword', 'shield', 'overworld',
        (subset) => it(`changes all ${subset} data`, () => {
            const input = rom.slice();
            const option = `randomize_${subset}`;

            const actual = randomize(input, { mode: 'blackout', [option]: true });

            should_have_expected_data(actual, base[subset], () => [0, 0], () => [0x20, 0x40, 0, 0x40, 0x80]);
        }));

    });

    context('with negative mode', () => {

        with_cases('dungeon', 'sword', 'shield', 'overworld',
        (subset) => it(`changes all ${subset} data`, () => {
            const input = rom.slice();
            const option = `randomize_${subset}`;
            const data = negative[subset];

            const actual = randomize(input, { mode: 'negative', [option]: true });

            should_have_expected_data(actual, base[subset], i => data.raw[i], i => data.oam[i]);
        }));

    });

    context('with grayscale mode', () => {

        with_cases('dungeon', 'sword', 'shield', 'overworld',
        (subset) => it(`changes all ${subset} data`, () => {
            const input = rom.slice();
            const option = `randomize_${subset}`;
            const data = grayscale[subset];

            const actual = randomize(input, { mode: 'grayscale', [option]: true });

            should_have_expected_data(actual, base[subset], i => data.raw[i], i => data.oam[i]);
        }));

    });

    context('with maseya blend mode', () => {

        with_cases('dungeon', 'sword', 'shield', 'overworld',
        (subset) => it(`changes all ${subset} data`, () => {
            const input = rom.slice();
            const option = `randomize_${subset}`;
            const data = maseya[subset];

            const actual = randomize(input, { mode: 'maseya', [option]: true }, next_blend(data.random));

            should_have_expected_data(actual, base[subset], i => data.raw[i], i => data.oam[i]);
        }));

        function next_blend(source) {
            return function* () {
                for (const args of source) {
                    yield color_f(...args);
                }
            }
        }

    });

    function should_have_expected_data(actual, base, raw, oam) {
        for (const i of offsets(base.raw)) {
            const expected = raw(i);
            slice(actual, i, i + 2).should.be.deep.equal(expected, `at raw ${i}`);
        }
        for (const i of offsets(base.oam)) {
            const expected = oam(i);
            slice(actual, i + 0, i + 2).should.be.deep.equal(slice(expected, 0, 2), `at oam ${i + 0}`);
            slice(actual, i + 3, i + 5).should.be.deep.equal(slice(expected, 3, 5), `at oam ${i + 3}`);
        }
    }

    function offsets(obj) {
        return map(keys(obj), parseInt);
    }

});
