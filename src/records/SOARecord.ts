import BufferCursor from "../buffercursor";
import { readHostLabel, writeHostLabel } from "../packet/packetUtils";
import { Record, InputResourceRecord } from "./Record";

export interface SOA_Record extends InputResourceRecord {
    primary: string,
    admin: string,
    serial: number,
    refresh: number,
    retry: number,
    expiration: number,
    minimum: number;
}

export class SOA extends Record {
    primary: string;
    admin: string;
    serial: number;
    refresh: number;
    retry: number;
    expiration: number;
    minimum: number;
    constructor(opts: SOA_Record) {
        super({ ...opts, type: 6 });
        this.primary = opts.primary;
        this.admin = opts.admin;
        this.serial = opts.serial;
        this.refresh = opts.refresh;
        this.retry = opts.retry;
        this.expiration = opts.expiration;
        this.minimum = opts.minimum;
    }
    public write(cursor: BufferCursor) {
        writeHostLabel(this.primary, cursor);
        writeHostLabel(this.admin, cursor);
        cursor.writeUInt32BE(this.serial & 0xFFFFFFFF);
        cursor.writeInt32BE(this.refresh & 0xFFFFFFFF);
        cursor.writeInt32BE(this.retry & 0xFFFFFFFF);
        cursor.writeInt32BE(this.expiration & 0xFFFFFFFF);
        cursor.writeInt32BE(this.minimum & 0xFFFFFFFF);
    }
    static parse(val: SOA_Record, cursor: BufferCursor) {
        val.primary = readHostLabel(cursor);
        val.admin = readHostLabel(cursor);
        val.serial = cursor.readUInt32BE();
        val.refresh = cursor.readInt32BE();
        val.retry = cursor.readInt32BE();
        val.expiration = cursor.readInt32BE();
        val.minimum = cursor.readInt32BE();
        return new SOA(val);
    }
}
