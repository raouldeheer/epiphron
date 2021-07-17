import BufferCursor from "#utils/buffercursor";
import { InputResourceRecord, Record } from "./Record";

export interface TXT_Record extends InputResourceRecord {
    data: string[];
}

export class TXT extends Record {
    data: string[];
    constructor(opts: TXT_Record) {
        super({ ...opts, type: 16 });
        this.data = opts.data;
    }
    public write(cursor: BufferCursor) {
        for (var i = 0, len = this.data.length; i < len; i++) {
            var dataLen = Buffer.byteLength(this.data[i], 'utf8');
            cursor.writeUInt8(dataLen);
            cursor.write(this.data[i], dataLen, 'utf8');
        }
    }
    static parse(val: TXT_Record, cursor: BufferCursor, len: number) {
        val.data = [];
        const end = cursor.tell() + len;
        while (cursor.tell() != end) {
            const length = cursor.readUInt8();
            val.data.push(cursor.toString('utf8', length));
        }
        return new TXT(val);
    }
}

export interface DATA_Record extends InputResourceRecord {
    data: Buffer[];
}

export class DATA extends Record {
    data: Buffer[];
    constructor(opts: DATA_Record) {
        super({ ...opts, type: 16 });
        this.data = opts.data;
    }
    public write(cursor: BufferCursor) {
        for (var i = 0, len = this.data.length; i < len; i++) {
            const dataLen = this.data[i].byteLength;
            cursor.writeUInt8(dataLen);
            cursor.writeBuff(this.data[i], dataLen);
        }
    }
}