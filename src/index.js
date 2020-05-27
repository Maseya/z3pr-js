import build_offsets from './offsets/';
import palette_editor from './palette_editor';

import color_f from './color_f';

import map from 'lodash/map';
import each from 'lodash/each';

export function randomize_copy(rom, options) { return randomize(rom.slice(), options); }

export function randomize(rom, options = {}) {
    if (options.mode === 'none')
        return rom;

    const algorithms = {
        blackout: [(x, y) => y, color_f.black],
    };
    const algorithm = algorithms[options.mode];
    if (!algorithm)
        throw new Error(`Invalid randomize mode: ${options.mode}`);

    const palette_editors = map(build_offsets(options), offsets => palette_editor(rom, offsets));

    each(palette_editors, editor => editor.blend(...algorithm));

    each(palette_editors, editor => editor.write_to_rom(rom));

    return rom;
}
