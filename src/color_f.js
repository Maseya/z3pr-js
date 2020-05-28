import clamp from 'lodash/clamp';
import max from 'lodash/max';
import min from 'lodash/min';

const { abs } = Math;

const luma_r = .299;
const luma_g = .587;
const luma_b = .114;

function color_f(r, g, b) {
    const methods = {};

    r = clamp(r, 0, 1);
    g = clamp(g, 0, 1);
    b = clamp(b, 0, 1);

    methods.hue = hue;
    function hue() {
        // When chroma is zero, there is no hue, as the color is not any more
        // red, green, or blue.Technically, NaN should be returned, but this
        // causes a lot of exceptional circumstances that need to be checked,
        // especially in blending. So we just say the hue is vacuously zero.
        // This doesn't hurt the structure in any way and lets us make
        // assumptions during other calculations.
        const _chroma = chroma();
        if (_chroma === 0)
            return 0;

        const _max = max([r, g, b]);
        let hue;
        if (_max == r) {
            hue = (g - b) / _chroma;
            if (hue < 0)
                hue += 6;
        }
        else if (_max == g) {
            hue = ((b - r) / _chroma) + 2;
        }
        else {
            // _max is Blue
            hue = ((r - g) / _chroma) + 4;
        }

        return hue / 6;
    }

    // chroma
    methods.chroma = chroma;
    function chroma() {
        return max([r, g, b]) - min([r, g, b]);
    }

    methods.luma = luma;
    function luma() {
        return (luma_r * r) + (luma_g * g) + (luma_b * b);
    }

    methods.grayscale = () => color_f.from_hcy(0, 0, luma());

    methods.invert = () => color_f(1 - r, 1 - g, 1 - b);

    return { ...methods, r, g, b };
}

color_f.from_hcy = (hue, chroma, luma) => {
    chroma = clamp(chroma, 0, 1);
    luma = clamp(luma, 0, 1);
    const [r, g, b] = rgb_from_hc(hue, chroma);

    const base_r = r * luma_r;
    const base_g = g * luma_g;
    const base_b = b * luma_b;
    const base_luma = base_r + base_g + base_b;
    const min = clamp(luma - base_luma, 0, 1);
    return color_f(min + r, min + g, min + b);
};

function rgb_from_hc(hue, chroma) {
    if (chroma === 0)
        return [0, 0, 0];

    while (hue < 0) hue += 1;
    while (hue >= 1) hue -= 1;

    hue *= 6;
    const x = chroma * (1 - abs((hue % 2) - 1));
    return hue <= 1 ? [chroma, x, 0]
        : hue <= 2 ? [x, chroma, 0]
        : hue <= 3 ? [0, chroma, x]
        : hue <= 4 ? [0, x, chroma]
        : hue <= 5 ? [x, 0, chroma]
                   : [chroma, 0, x];
}

color_f.black = color_f(0, 0, 0);

export default color_f;
