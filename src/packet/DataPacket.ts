import BufferCursor, { BufferCursorOverflow } from '../buffercursor';
import { Socket } from "../sockets";
import { Question } from "../requestTypes";
import { parseRecord, Record } from "../records/index";
import {
    parseHeaders,
    readHostLabel,
    writeHeaders,
    writeHostLabel,
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
    constructor(socket?: Socket) {
        this.socket = socket;
        this.header = {
            id: 0,
            qr: 0,
            opcode: 0,
            aa: 1,
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
    }

    write(buff: BufferCursor): number {
        function writeToBuff(buff: BufferCursor, packet: DataPacket, startPos: number, i: number): number {
            try {
                // Writing headers.
                writeHeaders(buff, packet);
        
                // Writing question.
                packet.question.forEach(value => {
                    writeHostLabel(value.name, buff);
                    buff.writeUInt16BE(value.type & 0xFFFF);
                    buff.writeUInt16BE(value.class & 0xFFFF);
                });
        
                // Writing resource records.
                packet.answer.forEach(record => record.writeRecord(buff));
                packet.authority.forEach(record => record.writeRecord(buff));
                packet.additional.forEach(record => record.writeRecord(buff));
        
                // return cursor position for end of data pointer.
                return buff.tell();
            } catch (error) {
                if (error instanceof BufferCursorOverflow) {
                    packet.additional = [];               // Remove additionals.
                    if (i >= 1) packet.authority = [];    // Remove authoritys.
                    if (i >= 2) packet.answer = [];       // Remove answers.
                    packet.header.tc = 1;                 // Set truncate bit.
                    buff.seek(startPos);
                    return writeToBuff(buff, packet, startPos, ++i);
                }
            }
            return 0;
        }
        return writeToBuff(buff, this, buff.tell(), 0);
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

        const buff: Buffer = this.socket.buffer();
        const buffercursor = new BufferCursor(buff);
        this.write(buffercursor);

        // console.log(len);
        // console.log(buff);
        this.socket.send(buffercursor);
    }

}
