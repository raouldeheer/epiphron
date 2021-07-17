import ipaddr from "ipaddr.js";
import BufferCursor from "#utils/buffercursor";
import { Record, InputResourceRecord } from "./Record";

export interface Address_Record extends InputResourceRecord {
    address: string;
}

class AddressRecord extends Record {
    address: string;
    constructor(opts: A_Record | AAAA_Record) {
        // @ts-ignore
        super(opts);
        this.address = opts.address;
    }
    public write(cursor: BufferCursor) {
        ipaddr.parse(this.address).toByteArray()
            .forEach((b: any) => {
                cursor.writeUInt8(b);
            });
    }
    static parse(val: Address_Record, cursor: BufferCursor) {
        if (val.type == 1) {
            val.address =
                '' + cursor.readUInt8() +
                '.' + cursor.readUInt8() +
                '.' + cursor.readUInt8() +
                '.' + cursor.readUInt8();
            return new A(val);
        } else {
            let address = '';
            for (var i = 0; i < 8; i++) {
                if (i > 0)
                    address += ':';
                address += cursor.readUInt16BE().toString(16);
            }
            val.address = address;
            return new AAAA(val);
        }
    }
}

export type A_Record = Address_Record;
export class A extends AddressRecord {
    constructor(opts: A_Record) {
        super({ ...opts, type: 1 });
    }
}

export type AAAA_Record = Address_Record;
export class AAAA extends AddressRecord {
    constructor(opts: AAAA_Record) {
        super({ ...opts, type: 28 });
    }
}
