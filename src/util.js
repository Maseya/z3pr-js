import _max from 'lodash/max';
import _min from 'lodash/min';

export function max(...args) {
    return _max(args);
}

export function min(...args) {
    return _min(args);
}

export function le_dw_value(bytes, i) {
    return bytes[i+0] | (bytes[i+1] << 8);
}

export function le_dw_bytes(value, d, i) {
    d[i + 0] = value & 0xFF;
    d[i + 1] = (value >>> 8) & 0xFF;
    return d;
}
