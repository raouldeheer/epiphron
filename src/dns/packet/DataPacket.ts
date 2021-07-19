import BufferCursor, { BufferCursorOverflow } from '#utils/buffercursor';
import { Socket, UDPSocket } from "#dns/sockets";
import { Question } from "#dns/requestTypes";
import { parseRecord, Record } from "#records/index";
import {
    parseHeaders,
    readHostLabel,
    writeHeaders,
    writeHostLabel
} from "./packetUtils";

interface Header {
    id: number;
    qr: number;
    opcode: number;
    aa: number;
    tc: number;
    rd: number;
    ra: number;
    res1: number;
    res2: number;
    res3: number;
    rcode: number;
}

export default class DataPacket {
    header: Header;
    question: Question[];
    answer: Record[];
    authority: Record[];
    additional: Record[];
    socket?: Socket;
    isUDP?: boolean;
    constructor(socket?: Socket, isUDP?: boolean) {
        this.socket = socket;
        this.header = {
            id: 0,
            qr: 0,
            opcode: 0,
            aa: 0,
            tc: 0,
            rd: 1,
            ra: 0,
            res1: 0,
            res2: 0,
            res3: 0,
            rcode: 0
        };
        this.question = [];
        this.answer = [];
        this.authority = [];
        this.additional = [];
        this.isUDP = isUDP;
    }

    public get size(): number {
        const getSize = (object: Record): number => JSON.stringify(object).length;

        return this.additional.reduce((prev, curr) => (prev + getSize(curr)), 0) +
            this.answer.reduce((prev, curr) => (prev + getSize(curr)), 0) +
            this.authority.reduce((prev, curr) => (prev + getSize(curr)), 0);
    }

    write(buff: BufferCursor): number {
        const labels = {};

        try {
            // Set truncated properties if packet is too large.
            if (this.isUDP) {
                const size = this.size;
                console.log(`Packet size: ${size}`);
                if (size > 500) {
                    this.additional = []; // Remove additionals.
                    this.answer = [];     // Remove answers.
                    this.authority = [];  // Remove authoritys.
                    this.header.tc = 1;   // Set truncate bit.
                }
            }

            // Writing headers
            writeHeaders(buff, this);

            // Writing question.
            this.question.forEach(value => {
                writeHostLabel(value.name, buff, labels);
                buff.writeUInt16BE(value.type & 0xFFFF);
                buff.writeUInt16BE(value.class & 0xFFFF);
            });

            // Return if packet is truncated.
            if (this.header.tc == 1) return buff.tell();

            // Writing resource records.
            this.answer.forEach(record => record.writeRecord(buff, labels));
            this.authority.forEach(record => record.writeRecord(buff, labels));
            this.additional.forEach(record => record.writeRecord(buff, labels));

            // return cursor position for end of data pointer.
            return buff.tell();

        } catch (error) {
            if (error instanceof BufferCursorOverflow) {
                // This overflow shouldn't occur.
                console.log("overflow");
                return 0;
            } else {
                throw error;
            }
        }
    }

    static parse(msgInput: Buffer, socket?: Socket) {
        const packet = new DataPacket(socket);
        const msg = new BufferCursor(msgInput);

        // Parse Headers.
        parseHeaders(msg, packet);

        // Parse Questions.
        for (let i = 0; i < packet.question.length; i++) {
            packet.question[i] = {
                name: readHostLabel(msg),
                type: msg.readUInt16BE(),
                class: msg.readUInt16BE(),
            };
        }

        // Parse Resource Records.
        for (let i = 0; i < packet.answer.length; i++) {
            packet.answer[i] = parseRecord(msg);
        }
        for (let i = 0; i < packet.authority.length; i++) {
            packet.authority[i] = parseRecord(msg);
        }
        for (let i = 0; i < packet.additional.length; i++) {
            packet.additional[i] = parseRecord(msg);
        }

        // Return Packet.
        return packet;
    }

    send() {
        if (!this.socket) return;
        let size;

        size = size || this.socket.base_size;
        size = 16384; // TODO figure out what size the packet should be.

        size = 65526;

        const buff: Buffer = this.socket.buffer(size);
        const buffercursor = new BufferCursor(buff);
        this.write(buffercursor);

        // console.log(len);
        // console.log(buff);
        this.socket.send(buffercursor);
    }

}

