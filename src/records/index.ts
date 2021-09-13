import { NAME_TO_QTYPE } from "../packet/consts";
import BufferCursor from "../buffercursor";
import { A, AAAA, Address_Record } from "./AddressRecord";
import { Record, ResourceRecord } from "./Record";
import { NS, CNAME, PTR, DataString_Record, NS_Record, CNAME_Record, PTR_Record } from "./DataStringRecord";
import { TXT, TXT_Record, DATA, DATA_Record } from "./TXTRecord";
import { MX, MX_Record } from "./MXRecord";
import { SRV, SRV_Record } from "./SRVRecord";
import { SOA, SOA_Record } from "./SOARecord";
import { NAPTR, NAPTR_Record } from "./NAPTRRecord";
import { readHostLabel } from "../packet/packetUtils";

export {
    Record, ResourceRecord,
    A, AAAA, Address_Record,
    NS, NS_Record,
    CNAME, CNAME_Record,
    PTR, PTR_Record,
    DataString_Record,
    TXT, TXT_Record,
    DATA, DATA_Record,
    MX, MX_Record,
    SRV, SRV_Record,
    SOA, SOA_Record,
    NAPTR, NAPTR_Record,
};

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
