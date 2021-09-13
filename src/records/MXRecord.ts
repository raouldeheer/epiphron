import BufferCursor from "../buffercursor";
import { readHostLabel, writeHostLabel } from "../packet/packetUtils";
import { Record, InputResourceRecord } from "./Record";

export interface MX_Record extends InputResourceRecord {
    priority: number,
    exchange: string;
}

export class MX extends Record {
    priority: number;
    exchange: string;
    constructor(opts: MX_Record) {
        super({ ...opts, type: 15 });
        this.priority = opts.priority;
        this.exchange = opts.exchange;
    }
    public write(cursor: BufferCursor) {
        cursor.writeUInt16BE(this.priority & 0xFFFF);
        writeHostLabel(this.exchange, cursor);
    }
    static parse(val: MX_Record, cursor: BufferCursor) {
        val.priority = cursor.readUInt16BE();
        val.exchange = readHostLabel(cursor);
        return new MX(val);
    }
}
