import { ResourceRecord } from "#records/index";
import * as net from 'net';

export enum requestTypes {
	CL = 'cl',
	CR = 'cr',
	SR = 'sr',
	LR = 'lr',
	CD = 'cd'
}

export enum cnameTypes {
	NXT = 'NXT',
	EOT = 'EOT',
	FNF = 'FNF',
	BPS = 'BPS',
	GPE = 'GPE'
}

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
