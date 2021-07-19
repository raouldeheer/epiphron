export default class BufferCursor {
    private pos: number;
    private noAssert: boolean | undefined;
    buffer: Buffer;
    length: number;
    constructor(buff: Buffer, noAssert?: boolean) {
        this.pos = 0;
        this.noAssert = noAssert;
        if (this.noAssert === undefined)
            this.noAssert = true;
        this.buffer = buff;
        this.length = buff.length;
    }
    private move(step: number) {
        this.checkWrite(step);
        this.pos += step;
    }
    private checkWrite(size: number) {
        let shouldThrow = false;

        const length = this.length;
        const pos = this.pos;

        if (size > length)
            shouldThrow = true;

        if (length - pos < size)
            shouldThrow = true;

        if (shouldThrow) throw new BufferCursorOverflow(length, pos, size);
    }
    getBuffer(offset: number = 0) {
        const result = Buffer.alloc(this.pos);
        this.buffer.copy(result, offset, 0, this.pos);
        return result;
    }
    seek(pos: number) {
        if (pos < 0) throw new RangeError('Cannot seek before start of buffer');
        if (pos > this.length) throw new RangeError('Trying to seek beyond buffer');
        this.pos = pos;
        return this;
    }
    eof() {
        return this.pos == this.length;
    }
    tell() {
        return this.pos;
    }
    slice(length?: number) {
        const end = length === undefined ? this.length : this.pos + length;

        const buf = new BufferCursor(this.buffer.slice(this.pos, end));
        this.seek(end);

        return buf;
    }
    toString(encoding: BufferEncoding | undefined, length: number | undefined) {
        const end = length === undefined ? this.length : this.pos + length;
        if (!encoding) encoding = 'utf8';

        const ret = this.buffer.toString(encoding, this.pos, end);
        this.seek(end);
        return ret;
    }
    write(value: string, length: number, encoding: BufferEncoding | undefined) {
        const ret = this.buffer.write(value, this.pos, length, encoding);
        this.move(ret);
        return this;
    }
    writeBuff(value: Buffer, length: number) {
        value.copy(this.buffer, this.pos, 0, length);
        this.move(length);
        return this;
    }
    fill(value: string | number | Uint8Array, length: number | undefined) {
        const end = length === undefined ? this.length : this.pos + length;
        this.checkWrite(end - this.pos);

        this.buffer.fill(value, this.pos, end);
        this.seek(end);
        return this;
    }
    copy(source: BufferCursor | Buffer, sourceStart?: number, sourceEnd?: number) {
        if (!sourceEnd) sourceEnd = source.length;
        if (!sourceStart) sourceStart = source instanceof BufferCursor ? source.pos : 0;

        const length = sourceEnd - sourceStart;
        this.checkWrite(length);
        const buf = source instanceof BufferCursor ? source.buffer : source;

        buf.copy(this.buffer, this.pos, sourceStart, sourceEnd);
        this.move(length);
        return this;
    }
    readUInt8() {
        var ret = this.buffer.readUInt8(this.pos);
        this.move(1);
        return ret;
    }
    readInt8() {
        var ret = this.buffer.readInt8(this.pos);
        this.move(1);
        return ret;
    }
    readInt16BE() {
        var ret = this.buffer.readInt16BE(this.pos);
        this.move(2);
        return ret;
    }
    readInt16LE() {
        var ret = this.buffer.readInt16LE(this.pos);
        this.move(2);
        return ret;
    }
    readUInt16BE() {
        var ret = this.buffer.readUInt16BE(this.pos);
        this.move(2);
        return ret;
    }
    readUInt16LE() {
        var ret = this.buffer.readUInt16LE(this.pos);
        this.move(2);
        return ret;
    }
    readUInt32LE() {
        var ret = this.buffer.readUInt32LE(this.pos);
        this.move(4);
        return ret;
    }
    readUInt32BE() {
        var ret = this.buffer.readUInt32BE(this.pos);
        this.move(4);
        return ret;
    }
    readInt32LE() {
        var ret = this.buffer.readInt32LE(this.pos);
        this.move(4);
        return ret;
    }
    readInt32BE() {
        var ret = this.buffer.readInt32BE(this.pos);
        this.move(4);
        return ret;
    }
    readFloatBE() {
        var ret = this.buffer.readFloatBE(this.pos);
        this.move(4);
        return ret;
    }
    readFloatLE() {
        var ret = this.buffer.readFloatLE(this.pos);
        this.move(4);
        return ret;
    }
    readDoubleBE() {
        var ret = this.buffer.readDoubleBE(this.pos);
        this.move(8);
        return ret;
    }
    readDoubleLE() {
        var ret = this.buffer.readDoubleLE(this.pos);
        this.move(8);
        return ret;
    }
    writeUInt8(value: number) {
        this.checkWrite(1);
        this.buffer.writeUInt8(value, this.pos);
        this.move(1);
        return this;
    }
    writeInt8(value: number) {
        this.checkWrite(1);
        this.buffer.writeInt8(value, this.pos);
        this.move(1);
        return this;
    }
    writeUInt16BE(value: number) {
        this.checkWrite(2);
        this.buffer.writeUInt16BE(value, this.pos);
        this.move(2);
        return this;
    }
    writeUInt16LE(value: number) {
        this.checkWrite(2);
        this.buffer.writeUInt16LE(value, this.pos);
        this.move(2);
        return this;
    }
    writeInt16BE(value: number) {
        this.checkWrite(2);
        this.buffer.writeInt16BE(value, this.pos);
        this.move(2);
        return this;
    }
    writeInt16LE(value: number) {
        this.checkWrite(2);
        this.buffer.writeInt16LE(value, this.pos);
        this.move(2);
        return this;
    }
    writeUInt32BE(value: number) {
        this.checkWrite(4);
        this.buffer.writeUInt32BE(value, this.pos);
        this.move(4);
        return this;
    }
    writeUInt32LE(value: number) {
        this.checkWrite(4);
        this.buffer.writeUInt32LE(value, this.pos);
        this.move(4);
        return this;
    }
    writeInt32BE(value: number) {
        this.checkWrite(4);
        this.buffer.writeInt32BE(value, this.pos);
        this.move(4);
        return this;
    }
    writeInt32LE(value: number) {
        this.checkWrite(4);
        this.buffer.writeInt32LE(value, this.pos);
        this.move(4);
        return this;
    }
    writeFloatBE(value: number) {
        this.checkWrite(4);
        this.buffer.writeFloatBE(value, this.pos);
        this.move(4);
        return this;
    }
    writeFloatLE(value: number) {
        this.checkWrite(4);
        this.buffer.writeFloatLE(value, this.pos);
        this.move(4);
        return this;
    }
    writeDoubleBE(value: number) {
        this.checkWrite(8);
        this.buffer.writeDoubleBE(value, this.pos);
        this.move(8);
        return this;
    }
    writeDoubleLE(value: number) {
        this.checkWrite(8);
        this.buffer.writeDoubleLE(value, this.pos);
        this.move(8);
        return this;
    }
}

export class BufferCursorOverflow extends Error {
    constructor(length: number, pos: number, size: number) {
        super(`BufferCursorOverflow: length ${length}, position ${pos}, size ${size}`);
        this.name = 'BufferCursorOverflow';
        this.message = `BufferCursorOverflow: length ${length}, position ${pos}, size ${size}`;
    }
}
