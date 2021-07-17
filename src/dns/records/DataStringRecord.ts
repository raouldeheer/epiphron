import BufferCursor from "#utils/buffercursor";
import { readHostLabel, writeHostLabel } from "#packet/packetUtils";
import { Record, InputResourceRecord } from "./Record";

export interface DataString_Record extends InputResourceRecord {
    data: string;
}

class DataStringRecord extends Record {
    data: string;
    constructor(opts: CNAME_Record | PTR_Record | NS_Record) {
        // @ts-ignore
        super(opts);
        this.data = opts.data;
    }
    public write(cursor: BufferCursor, labels: any) {
        writeHostLabel(this.data, cursor, labels);
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
    constructor(opts: NS_Record) {
        super({ ...opts, type: 2 });
    }
}

export type CNAME_Record = DataString_Record;
export class CNAME extends DataStringRecord {
    constructor(opts: CNAME_Record) {
        super({ ...opts, type: 5 });
    }
}

export type PTR_Record = DataString_Record;
export class PTR extends DataStringRecord {
    constructor(opts: PTR_Record) {
        super({ ...opts, type: 12 });
    }
}
