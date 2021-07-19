import mylas from "mylas";
import fs from "fs";

const maxChars = 255;
const length = 7767;
const maxLength = length * 8;

export function getSubStrings(input: string): string[][] {
    const results: string[][] = [];
    for (let i = 0; i < 8; i++) {
        const subString = input.substr(length * i, length);
        if (subString == "") break;
        const chars = [];
        for (let j = 0; j < 31; j++) {
            const subChars = subString.substr(maxChars * j, maxChars);
            if (subChars == "") break;
            chars[j] = subChars;
        }
        results[i] = chars;
    }
    return results;
}

export function getSubBuffers(input: Buffer): Buffer[][] {
    const results: Buffer[][] = [];
    for (let i = 0; i < 8; i++) {
        const subBuffer = input.slice(length * i, (length * i) + length);
        if (subBuffer.length == 0) break;
        const BufferLines = [];
        for (let j = 0; j < 31; j++) {
            const subBufferLines = subBuffer.slice(maxChars * j, (maxChars * j) + maxChars);
            if (subBufferLines.length == 0) break;
            BufferLines[j] = subBufferLines;
        }
        results[i] = BufferLines;
    }
    return results;
}

export function loadData(path: string) {
    const rawData = mylas.loadS(path);
    if (rawData.length > maxLength) throw new Error("String to long!");
    return getSubStrings(rawData);
}

export function loadDataBuffer(path: string) {
    const rawData = fs.readFileSync(path);
    if (rawData.length > maxLength) throw new Error("String to long!");
    return getSubBuffers(rawData);
}

export function getDomainParts(domain: string) {
    return domain.split('.').filter((v, i, a) => {
        if (i <= a.length - 4)
            return v;
    });
}
