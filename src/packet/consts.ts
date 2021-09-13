function reverse_map(src: any) {
  const dst = {};

  for (const k in src) {
    if (src.hasOwnProperty(k)) {
      //@ts-ignore
      dst[src[k]] = k;
    }
  }
  return dst;
}

/* http://www.iana.org/assignments/dns-parameters */
export const NAME_TO_QTYPE = {
  A: 1,
  NS: 2,
  MD: 3,
  MF: 4,
  CNAME: 5,
  SOA: 6,
  MB: 7,
  MG: 8,
  MR: 9,
  'NULL': 10,
  WKS: 11,
  PTR: 12,
  HINFO: 13,
  MINFO: 14,
  MX: 15,
  TXT: 16,
  RP: 17,
  AFSDB: 18,
  X25: 19,
  ISDN: 20,
  RT: 21,
  NSAP: 22,
  'NSAP-PTR': 23,
  SIG: 24,
  KEY: 25,
  PX: 26,
  GPOS: 27,
  AAAA: 28,
  LOC: 29,
  NXT: 30,
  EID: 31,
  NIMLOC: 32,
  SRV: 33,
  ATMA: 34,
  NAPTR: 35,
  KX: 36,
  CERT: 37,
  A6: 38,
  DNAME: 39,
  SINK: 40,
  OPT: 41,
  APL: 42,
  DS: 43,
  SSHFP: 44,
  IPSECKEY: 45,
  RRSIG: 46,
  NSEC: 47,
  DNSKEY: 48,
  DHCID: 49,
  NSEC3: 50,
  NSEC3PARAM: 51,
  TLSA: 52,
  HIP: 55,
  NINFO: 56,
  RKEY: 57,
  TALINK: 58,
  CDS: 59,
  SPF: 99,
  UINFO: 100,
  UID: 101,
  GID: 102,
  UNSPEC: 103,
  TKEY: 249,
  TSIG: 250,
  IXFR: 251,
  AXFR: 252,
  MAILB: 253,
  MAILA: 254,
  ANY: 255,
  URI: 256,
  CAA: 257,
  TA: 32768,
  DLV: 32769
};
export const QTYPE_TO_NAME = reverse_map(NAME_TO_QTYPE);

export function nameToQtype(n: string): number {
  //@ts-ignore
  return NAME_TO_QTYPE[n.toUpperCase()];
}

export function qtypeToName(t: number): string {
  //@ts-ignore
  return QTYPE_TO_NAME[t];
}

export const NAME_TO_QCLASS = {
  IN: 1
};
export const QCLASS_TO_NAME = reverse_map(NAME_TO_QCLASS);
export const QTYPE_TO_FAMILY = {
  1: 4,
  28: 6
};

export const FAMILY_TO_QTYPE = {
  4: NAME_TO_QTYPE.A,
  6: NAME_TO_QTYPE.AAAA
};

export const NAME_TO_RCODE = {
  NOERROR: 0,
  FORMERR: 1,
  SERVFAIL: 2,
  NOTFOUND: 3,
  NOTIMP: 4,
  REFUSED: 5,
  YXDOMAIN: 6,
  YXRRSET: 7,
  NXRRSET: 8,
  NOTAUTH: 9,
  NOTZONE: 10,
  BADVERS: 16,
  BADSIG: 16,
  BADKEY: 17,
  BADTIME: 18,
  BADMODE: 19,
  BADNAME: 20,
  BADALG: 21,
  BADTRUNC: 22
};
export const RCODE_TO_NAME = reverse_map(NAME_TO_RCODE);

export const BADNAME = 'EBADNAME';
export const BADRESP = 'EBADRESP';
export const CONNREFUSED = 'ECONNREFUSED';
export const DESTRUCTION = 'EDESTRUCTION';
export const REFUSED = 'EREFUSED';
export const FORMERR = 'EFORMERR';
export const NODATA = 'ENODATA';
export const NOMEM = 'ENOMEM';
export const NOTFOUND = 'ENOTFOUND';
export const NOTIMP = 'ENOTIMP';
export const SERVFAIL = 'ESERVFAIL';
export const TIMEOUT = 'ETIMEOUT';
