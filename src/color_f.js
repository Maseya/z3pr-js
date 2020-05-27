import clamp from 'lodash/clamp';

const { abs } = Math;

const luma_r = .299;
const luma_g = .587;
const luma_b = .114;

function color_f(r, g, b) {
    const methods = {};

    r = clamp(r, 0, 1);
    g = clamp(g, 0, 1);
    b = clamp(b, 0, 1);

    const luma = () => (luma_r * r) + (luma_g * g) + (luma_b * b);
    methods.luma = luma;

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
