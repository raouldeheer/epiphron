const RFC4648 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function readChar(char: string): number {
    const id = RFC4648.indexOf(char);
    if (id == -1) throw new Error('Invalid character found: ' + char);
    return id;
}

export function encode(data: ArrayBuffer | Int8Array | Uint8Array | Uint8ClampedArray): string {
    let bits = 0;
    let value = 0;
    let output = new Uint8Array(data).reduce((prev, curr) => {
        value = (value << 8) | curr;
        bits += 8;
        while (bits >= 5) {
            prev += RFC4648[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
        return prev;
    }, '');
    if (bits > 0) output += RFC4648[(value << (5 - bits)) & 31];
    return output;
};

export function decode(input: string) {
    let bits = 0;
    let index = 0;
    let value = 0;
    const output = Array.from(input.replace(/=+$/, '')).reduce((prev, curr) => {
        value = (value << 5) | readChar(curr);
        bits += 5;
        if (bits >= 8) {
            bits -= 8;
            prev[index++] = value >>> bits;
        }
        return prev;
    }, new Uint8Array((input.length * 5 / 8) | 0));
    return output.buffer;
};
