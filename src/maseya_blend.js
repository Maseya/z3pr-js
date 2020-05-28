import color_f from './color_f';

const { max } = Math;

export default function (x, y) {
    console.log('chroma', x.luma());
    // Ensure at least a 5% change in hue.
    const hue = (y.r * .95) + .025 + x.hue();

    const chroma_shift = y.g - .5;
    let chroma = x.chroma();
    if (chroma_shift > 0) {
        // Put heavy limitations on oversaturating colors.
        chroma *= 1 + ((1 - chroma) * chroma_shift * .5);
    }
    else {
        // Put no limitation on desaturating colors.
        chroma *= .5 + chroma_shift;
    }

    const luma_shift = y.b - .5;
    let luma = x.luma();
    if (luma_shift > 0) {
        // Do not heavily brighten colors. However, if we removed a lot of
        // saturation, then we can allow for some brighter colors.
        const chroma_diff = max(chroma - x.chroma(), 0);
        luma *= 1 + ((1 - x.luma()) * luma_shift * (1 + chroma_diff));
    }
    else {
        // Do not let colors get too dark.
        luma *= 1 + ((.5 + luma_shift) / 1);
    }

    return color_f.from_hcy(hue, chroma, luma);
}
