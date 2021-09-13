import BufferCursor from "../buffercursor";
import { readHostLabel, writeHostLabel } from "../packet/packetUtils";
import { InputResourceRecord, Record } from "./Record";

export interface SRV_Record extends InputResourceRecord {
    priority: number,
    weight: number,
    port: number,
    target: string;
}

export class SRV extends Record {
    priority: number;
    weight: number;
    port: number;
    target: string;
    constructor(opts: SRV_Record) {
        super({ ...opts, type: 33 });
        this.priority = opts.priority;
        this.weight = opts.weight;
        this.port = opts.port;
        this.target = opts.target;
    }
    public write(cursor: BufferCursor) {
        cursor.writeUInt16BE(this.priority & 0xFFFF);
        cursor.writeUInt16BE(this.weight & 0xFFFF);
        cursor.writeUInt16BE(this.port & 0xFFFF);
        writeHostLabel(this.target, cursor);
    }
    static parse(val: SRV_Record, cursor: BufferCursor) {
        val.priority = cursor.readUInt16BE();
        val.weight = cursor.readUInt16BE();
        val.port = cursor.readUInt16BE();
        val.target = readHostLabel(cursor);
        return new SRV(val);
    }
}
