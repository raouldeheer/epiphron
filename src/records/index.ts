import { A, AAAA, Address_Record } from "./AddressRecord";
import { Record, ResourceRecord } from "./Record";
import { NS, CNAME, PTR, DataString_Record, NS_Record, CNAME_Record, PTR_Record } from "./DataStringRecord";
import { TXT, TXT_Record, DATA, DATA_Record } from "./TXTRecord";
import { MX, MX_Record } from "./MXRecord";
import { SRV, SRV_Record } from "./SRVRecord";
import { SOA, SOA_Record } from "./SOARecord";
import { NAPTR, NAPTR_Record } from "./NAPTRRecord";

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
