import color_f from './color_f';

const { max, sqrt } = Math;

const sqr = x => x * x;

export default function (x, y) {
    // Ensure at least a 2.5% change in hue.
    const hue = (y.r * .95) + .025 + x.hue();

    const chroma_shift = y.g - .5;
    const x_chroma = x.chroma();
    let chroma = x_chroma;
    if (chroma_shift > 0) {
        // Put heavy limitations on oversaturating colors.
        chroma *= 1 + ((1 - x_chroma) * chroma_shift * .5);
    }
    else {
        // Put no limitation on desaturating colors. However, make it more
        // likely that only a little desaturation will occur.
        chroma *= sqrt(1 - sqr(chroma_shift * 2));
    }

    const luma_shift = y.b - .5;
    const x_luma = x.luma();
    let luma = x_luma;
    if (luma_shift > 0) {
        // Do not heavily brighten colors. However, if we removed a lot of
        // saturation, then we can allow for some brighter colors.
        const chroma_diff = max(x_chroma - chroma, 0);
        luma *= 1 + ((1 - x_luma) * luma_shift * (1 + chroma_diff));
    }
    else {
        // Do not let colors get too dark.
        luma *= 1 + (luma_shift / 2);
    }

    return color_f.from_hcy(hue, chroma, luma);
}
