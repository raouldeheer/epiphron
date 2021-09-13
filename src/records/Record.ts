import BufferCursor from "../buffercursor";
import { writeHostLabel } from "../packet/packetUtils";

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
