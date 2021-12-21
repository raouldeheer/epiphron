import { A, AAAA, Address_Record, CNAME, DataString_Record, MX, MX_Record, NAPTR, NAPTR_Record, NS, PTR, SOA, SOA_Record, SRV, SRV_Record, TXT, TXT_Record } from ".";
import BufferCursor from "../buffercursor";
import { NAME_TO_QTYPE } from "../packet/consts";
import { readHostLabel, writeHostLabel } from "../packet/packetUtils";

export interface ResourceRecord {
    name: string,
    type: number,
    class: number,
    ttl: number;
}

export interface InputResourceRecord {
    name: string,
    type?: number,
    class?: number,
    ttl: number;
}

export abstract class Record implements ResourceRecord {
    name: string;
    type: number;
    class: number;
    ttl: number;
    constructor(opts: {
        name: string;
        type: number;
        class?: number;
        ttl: number;
    }) {
        this.name = opts.name;
        this.type = opts.type;
        this.class = opts.class || 1;
        this.ttl = opts.ttl;
    }

    // Writing
    public writeRecord(cursor: BufferCursor): void {
        // Pre-Write
        writeHostLabel(this.name, cursor);
        cursor.writeUInt16BE(this.type & 0xFFFF);
        cursor.writeUInt16BE(this.class & 0xFFFF);
        cursor.writeUInt32BE(this.ttl & 0xFFFFFFFF);
        const startPos = cursor.tell();
        cursor.writeUInt16BE(0); // this position will be updated in postWrite.

        // Write
        this.write(cursor);

        // Post-Write
        const endPos = cursor.tell();
        cursor.seek(startPos);
        cursor.writeUInt16BE(endPos - startPos - 2);
        cursor.seek(endPos);
    }
    abstract write(cursor: BufferCursor): void;
}

// Parsing
export function parseRecord(cursor: BufferCursor): Record {
    // Parse ResourceRecord
    let val: ResourceRecord = {
        name: readHostLabel(cursor),
        type: cursor.readUInt16BE(),
        class: cursor.readUInt16BE(),
        ttl: cursor.readUInt32BE(),
    };
    let len = cursor.readUInt16BE();

    // Parse Record type
    switch (val.type) {
        case NAME_TO_QTYPE.A: return A.parse(val as Address_Record, cursor);
        case NAME_TO_QTYPE.AAAA: return AAAA.parse(val as Address_Record, cursor);
        case NAME_TO_QTYPE.NS: return NS.parse(val as DataString_Record, cursor);
        case NAME_TO_QTYPE.CNAME: return CNAME.parse(val as DataString_Record, cursor);
        case NAME_TO_QTYPE.PTR: return PTR.parse(val as DataString_Record, cursor);
        case NAME_TO_QTYPE.SPF:
        case NAME_TO_QTYPE.TXT: return TXT.parse(val as TXT_Record, cursor, len);
        case NAME_TO_QTYPE.MX: return MX.parse(val as MX_Record, cursor);
        case NAME_TO_QTYPE.SRV: return SRV.parse(val as SRV_Record, cursor);
        case NAME_TO_QTYPE.SOA: return SOA.parse(val as SOA_Record, cursor);
        case NAME_TO_QTYPE.NAPTR: return NAPTR.parse(val as NAPTR_Record, cursor);
        default: return CNAME.parse(val as DataString_Record, cursor);
    }
}