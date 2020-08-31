import build_offsets from './offsets/';
import palette_editor from './palette_editor';
import { maseya_blend, classic_blend } from './blends';

import color_f from './color_f';
import random from './random';

import map from 'lodash/map';
import each from 'lodash/each';
import castArray from 'lodash/castArray';

export function randomize_copy(rom, ...args) { return randomize(rom.slice(), ...args); }

export function randomize(rom, options = {}, next_blend) {
    if (options.mode === 'none')
        return rom;

    const algorithms = {
        maseya: [maseya_blend, next_blend || random_blend],
        grayscale: [(x, y) => x.grayscale(), infinite_null],
        negative: [(x, y) => x.invert(), infinite_null],
        blackout: [(x, y) => y, infinite_black],
        classic: [classic_blend, next_blend || random_blend],
    };
    const algorithm = algorithms[options.mode];
    if (!algorithm)
        throw new Error(`Invalid randomize mode: ${options.mode}`);

    const palette_editors = map(build_offsets(options), offsets => palette_editor(rom, offsets));

    const [blend_fn, blend_gen] = algorithm;
    const blend_iter = blend_gen(options.seed);
    each(palette_editors, editor => editor.blend(blend_fn, blend_iter));

    each(palette_editors, editor => editor.write_to_rom(rom));

    return rom;
}

function* random_blend(seed) {
    const args = seed ? castArray(seed) : [];
    const rnd = random(...args);
    yield* infinite(() => color_f(rnd(), rnd(), rnd()));
}

function* infinite_null() {
    yield* infinite(() => null);
}

function* infinite_black() {
    yield* infinite(() => color_f.black);
}

function* infinite(fn) {
    while (true)
        yield fn();
}
