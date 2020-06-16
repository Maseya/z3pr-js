import isNil from 'lodash/isNil';

export default function sfc32(s1, s2, s3) {
    let a, b, c, n;

    seed(s1, s2, s3);

    return { next32 };

    function next32() {
        const t = (a + b + n) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = ((c << 21 | c >>> 11) + t) | 0;
        n = (n + 1) | 0;
        return t;
    }

    function seed(s1, s2, s3) {
        [a, b, c, n] = [s1, s2, s3, 1];
        isNil(s3) && ([a, b, c] = [0, s1, s2]);
        isNil(s2) && ([a, b, c] = [0, s1, 0]);
        const rounds = s3 == null ? 12 : 15;
        for (let i = 0; i < rounds; i++) next32();
    }
}
