import { ResourceRecord } from "./records/index";
import * as net from "net";

export interface Question {
	name: string,
	type: number,
	class: number;
}

export interface dnsRequest {
	header: {
		id: number,
		qr: number,
		opcode: number,
		aa: number,
		tc: number,
		rd: number,
		ra: number,
		res1: number,
		res2: number,
		res3: number,
		rcode: number;
	},
	question: Question[],
	answer: ResourceRecord[],
	authority: ResourceRecord[],
	additional: ResourceRecord[],
	address: net.AddressInfo;
}
