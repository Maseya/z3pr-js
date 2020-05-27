function color_f(r, g, b) {
    const methods = {};

    methods.invert = () => color_f(1 - r, 1 - g, 1 - b);

    return { ...methods, r, g, b };
}

color_f.black = color_f(0, 0, 0);

export default color_f;
