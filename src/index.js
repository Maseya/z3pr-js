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
        maseya: ['blend_uniformly', maseya_blend, next_blend || random_blend],
        grayscale: ['blend_uniformly', (x, y) => x.grayscale(), infinite_null],
        negative: ['blend_uniformly', (x, y) => x.invert(), infinite_null],
        blackout: ['blend_uniformly', (x, y) => y, infinite_black],
        classic: ['blend_uniformly', classic_blend, next_blend || random_blend],
        dizzy: ['blend_per_color', (x, y) => color_f.hue_blend(x, y), next_blend || random_blend],
        sick: ['blend_per_color', (x, y) => color_f.luma_blend(y, x), next_blend || random_blend],
        puke: ['blend_per_color', (x, y) => y, next_blend || random_blend],
    };
    const algorithm = algorithms[options.mode];
    if (!algorithm)
        throw new Error(`Invalid randomize mode: ${options.mode}`);

    const palette_editors = map(build_offsets(options), offsets => palette_editor(rom, offsets));

    const [blend_method, blend_fn, blend_gen] = algorithm;
    const blend_iter = blend_gen(options.seed);
    each(palette_editors, editor => editor[blend_method](blend_fn, blend_iter));

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
