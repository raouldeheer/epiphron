import BufferCursor from "../buffercursor";
import { readHostLabel, writeHostLabel } from "../packet/packetUtils";
import { Record, InputResourceRecord } from "./Record";

export interface NAPTR_Record extends InputResourceRecord {
    order: number,
    preference: number,
    flags: string,
    service: string,
    regexp: string,
    replacement: string;
}

export class NAPTR extends Record {
    order: number;
    preference: number;
    flags: string;
    service: string;
    regexp: string;
    replacement: string;
    public static qtype = 35;
    constructor(opts: NAPTR_Record) {
        super({ ...opts, type: NAPTR.qtype });
        this.order = opts.order;
        this.preference = opts.preference;
        this.flags = opts.flags;
        this.service = opts.service;
        this.regexp = opts.regexp;
        this.replacement = opts.replacement;
    }
    public write(cursor: BufferCursor) {
        cursor.writeUInt16BE(this.order & 0xFFFF);
        cursor.writeUInt16BE(this.preference & 0xFFFF);
        cursor.writeUInt8(this.flags.length);
        cursor.write(this.flags, this.flags.length, 'ascii');
        cursor.writeUInt8(this.service.length);
        cursor.write(this.service, this.service.length, 'ascii');
        cursor.writeUInt8(this.regexp.length);
        cursor.write(this.regexp, this.regexp.length, 'ascii');
        writeHostLabel(this.replacement, cursor);
    }
    static parse(val: NAPTR_Record, cursor: BufferCursor) {
        val.order = cursor.readUInt16BE();
        val.preference = cursor.readUInt16BE();
        let len = cursor.readUInt8();
        val.flags = cursor.toString('ascii', len);
        len = cursor.readUInt8();
        val.service = cursor.toString('ascii', len);
        len = cursor.readUInt8();
        val.regexp = cursor.toString('ascii', len);
        val.replacement = readHostLabel(cursor);
        return new NAPTR(val);
    }
}
