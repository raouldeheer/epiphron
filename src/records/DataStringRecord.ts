import BufferCursor from "../buffercursor";
import { readHostLabel, writeHostLabel } from "../packet/packetUtils";
import { Record, InputResourceRecord } from "./Record";

export interface DataString_Record extends InputResourceRecord {
    data: string;
}

class DataStringRecord extends Record {
    data: string;
    constructor(opts: DataString_Record) {
        // @ts-ignore
        super(opts);
        this.data = opts.data;
    }
    public write(cursor: BufferCursor) {
        writeHostLabel(this.data, cursor);
    }
    static parse(val: DataString_Record, cursor: BufferCursor) {
        val.data = readHostLabel(cursor);
        if (val.type == 2)
            return new NS(val);
        else if (val.type == 5)
            return new CNAME(val);
        else
            return new PTR(val);
    }
}

export type NS_Record = DataString_Record;
export class NS extends DataStringRecord {
    public static qtype = 2;
    constructor(opts: NS_Record) {
        super({ ...opts, type: NS.qtype });
    }
}

export type CNAME_Record = DataString_Record;
export class CNAME extends DataStringRecord {
    public static qtype = 5;
    constructor(opts: CNAME_Record) {
        super({ ...opts, type: CNAME.qtype });
    }
}

export type PTR_Record = DataString_Record;
export class PTR extends DataStringRecord {
    public static qtype = 12;
    constructor(opts: PTR_Record) {
        super({ ...opts, type: PTR.qtype });
    }
}
