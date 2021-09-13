import BufferCursor from "../buffercursor";
import DataPacket from "./DataPacket";

const LABEL_POINTER = 0xC0;

/**
 * readHostLabel reads all the label/hostnames before the data.
 * @param buff BufferCursor to read from.
 * @returns Hostname/Label of the resource.
 */
export function readHostLabel(buff: BufferCursor) {
    let result = "";
    let len = buff.readUInt8();
    let comp = false;
    let end = buff.tell();

    while (len !== 0) {
        if ((len & LABEL_POINTER) === LABEL_POINTER) {
            len -= LABEL_POINTER;
            len = len << 8;
            const pos = len + buff.readUInt8();
            if (!comp) end = buff.tell();
            buff.seek(pos);
            len = buff.readUInt8();
            comp = true;
            continue;
        }

        const part = buff.toString('ascii', len);
        result = result.length ? result + '.' + part : part;
        len = buff.readUInt8();
        if (!comp) end = buff.tell();
    }

    buff.seek(end);
    return result;
}

/**
 * writeHostLabel writes a label/hostname before the data is writen.
 * @param str Hostname to write as label.
 * @param buff BufferCursor to write to.
 */
export function writeHostLabel(str: string, buff: BufferCursor) {
    const index: any = {};
    let string: string | undefined = str;
    while (string) {
        if (index[string]) {
            const offset = (LABEL_POINTER << 8) + index[string];
            buff.writeUInt16BE(offset);
            break;
        } else {
            let part;
            index[string] = buff.tell();
            const dot = string.indexOf('.');
            if (dot > -1) {
                part = string.slice(0, dot);
                string = string.slice(dot + 1);
            } else {
                part = string;
                string = undefined;
            }
            buff.writeUInt8(part.length);
            buff.write(part, part.length, 'ascii');
        }
    }
    if (!string) buff.writeUInt8(0);
}

/**
 * writeHeaders writes the headers for the packet.
 * @param buff BufferCursor to write to.
 * @param packet Packet with the headers.
 */
export function writeHeaders(buff: BufferCursor, packet: DataPacket) {
    buff.writeUInt16BE(packet.header.id & 0xFFFF);
    let val = 0;
    val += (packet.header.qr << 15) &       0b1000000000000000; //0x8000;
    val += (packet.header.opcode << 11) &   0b0111100000000000; //0x7800;
    val += (packet.header.aa << 10) &       0b0000010000000000; //0x400;
    val += (packet.header.tc << 9) &        0b0000001000000000; //0x200;
    val += (packet.header.rd << 8) &        0b0000000100000000; //0x100;
    val += (packet.header.ra << 7) &        0b0000000010000000; //0x80;
    val += (packet.header.res1 << 6) &      0b0000000001000000; //0x40;
    val += (packet.header.res2 << 5) &      0b0000000000100000; //0x20;
    val += (packet.header.res3 << 4) &      0b0000000000010000; //0x10;
    val += packet.header.rcode &            0b0000000000001111; //0xF;
    buff.writeUInt16BE(val & 0xFFFF);
    buff.writeUInt16BE(packet.question.length & 0xFFFF);    // question length
    buff.writeUInt16BE(packet.answer.length & 0xFFFF);      // answer length
    buff.writeUInt16BE(packet.authority.length & 0xFFFF);   // authority length
    buff.writeUInt16BE(packet.additional.length & 0xFFFF);  // additional length
}

/**
 * parseHeaders parses the header for the packet
 * @param msg BufferCursor with data.
 * @param packet Packet to write to.
 */
export function parseHeaders(msg: BufferCursor, packet: DataPacket) {
    packet.header.id = msg.readUInt16BE();
    const val = msg.readUInt16BE();
    packet.header.qr = (val & 0x8000) >> 15;
    packet.header.opcode = (val & 0x7800) >> 11;
    packet.header.aa = (val & 0x400) >> 10;
    packet.header.tc = (val & 0x200) >> 9;
    packet.header.rd = (val & 0x100) >> 8;
    packet.header.ra = (val & 0x80) >> 7;
    packet.header.res1 = (val & 0x40) >> 6;
    packet.header.res2 = (val & 0x20) >> 5;
    packet.header.res3 = (val & 0x10) >> 4;
    packet.header.rcode = (val & 0xF);
    packet.question = new Array(msg.readUInt16BE());
    packet.answer = new Array(msg.readUInt16BE());
    packet.authority = new Array(msg.readUInt16BE());
    packet.additional = new Array(msg.readUInt16BE());
}
