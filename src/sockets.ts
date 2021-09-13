import { createSocket, RemoteInfo, Socket as dgramSocket, SocketType } from 'dgram';
import { EventEmitter } from 'events';
import { Socket as netSocket, connect, NetConnectOpts } from 'net';
import ipaddr from 'ipaddr.js';
import BufferCursor from './buffercursor';

export abstract class Socket extends EventEmitter {
    protected buff: Buffer | undefined;
    protected bound: boolean;
    protected unref: Function | undefined;
    protected ref: Function | undefined;
    constructor() {
        super();
        this.buff = undefined;
        this.bound = false;
        this.unref = undefined;
        this.ref = undefined;
    }
    public abstract buffer(): Buffer;
    public abstract send(buffercursor: BufferCursor): void;
}

export class UDPSocket extends Socket {
    private socket: dgramSocket;
    private remote: RemoteInfo | undefined;
    constructor(socket: dgramSocket, remote?: RemoteInfo) {
        super();
        this.socket = socket;
        this.remote = remote;
    }
    public buffer(): Buffer {
        return this.buff = Buffer.allocUnsafe(512);
    }
    public send(buffercursor: BufferCursor): void {
        const len = buffercursor.tell();
        this.socket.send(this.buff!, 0, len, this.remote!.port,
            this.remote!.address);
    }
    public bind(type: SocketType) {
        if (this.bound) {
            this.emit('ready');
        } else {
            this.socket = createSocket(type);
            this.socket.on('listening', () => {
                this.bound = true;
                if (this.socket.unref) {
                    this.unref = () => { this.socket.unref(); };
                    this.ref = () => { this.socket.ref(); };
                }
                this.emit('ready');
            });
            this.socket.on('message', this.emit.bind(this, 'message'));
            this.socket.on('close', () => {
                this.bound = false;
                this.emit('close');
            });
            this.socket.on('error', (error: Error) => {
                console.error(error.name);
                console.error(error.message);
            });
            this.socket.bind();
        }
    }
    close() {
        this.socket.close();
    }
    getRemote(remote: RemoteInfo) {
        return new UDPSocket(this.socket, remote);
    }
}

export class TCPSocket extends Socket {
    private Socket: netSocket;
    private rest: Buffer | undefined;
    constructor(socket: netSocket) {
        super();
        this.Socket = socket;
        this.Socket.on('error', this.error);
        this.rest = undefined;
    }
    private error(error: Error) {
        if (error.message.includes("ECONNRESET")) {
            this.Socket?.destroy();
            this.bound = false;
            this.emit('close');
        } else {
            console.error(error);
        }
    }
    public buffer(): Buffer {
        this.buff = Buffer.allocUnsafe(65528);
        return this.buff.slice(2);
    }
    public send(buffercursor: BufferCursor) {
        const len = buffercursor.tell();
        this.buff!.writeUInt16BE(len, 0);
        const finalBuffer = this.buff!.slice(0, len + 2);
        let total = 0;
        do {
            // this._socket.write(finalBuffer.slice(total, total+=4096));
            this.Socket.write(finalBuffer.slice(total, total += 63900));
        } while (total <= len);
    }
    public bind(server: { port: NetConnectOpts; address: (() => void) | undefined; }) {
        if (this.bound) {
            this.emit('ready');
        } else {
            this.Socket = connect(server.port, server.address);
            this.Socket.on('connect', () => {
                this.bound = true;
                if (this.Socket.unref) {
                    this.unref = () => {
                        this.Socket.unref();
                    };
                    this.ref = () => {
                        this.Socket.ref();
                    };
                }
                this.emit('ready');
            });
            const emitClose = () => {
                this.bound = false;
                this.emit('close');
            };
            this.Socket.on('timeout', emitClose);
            this.Socket.on('close', emitClose);
            this.Socket.on('error', (error: Error) => {
                console.error(error.name);
                console.error(error.message);
            });
            this.catchMessages();
        }
    }
    public catchMessages() {
        this.Socket.on('data', (data: Buffer) => {
            if (!this.rest) {
                this.rest = data;
            } else {
                const tmp = Buffer.allocUnsafe(this.rest.length + data.length);
                this.rest.copy(tmp, 0);
                data.copy(tmp, this.rest.length);
                this.rest = tmp;
            }
            while (this.rest && this.rest.length > 2) {
                const len = this.rest.readUInt16BE(0);
                if (this.rest.length >= len + 2) {
                    this.emit('message', this.rest.slice(2, len + 2), this);
                    this.rest = this.rest.slice(len + 2);
                } else break;
            }
        });
    }
}

export function reverseIP(ip: string) {
    const address = ipaddr.parse(ip.split(/%/)[0]);

    switch (address.kind()) {
        case 'ipv4':
            const addressBytes = address.toByteArray();
            addressBytes.reverse();
            return addressBytes.join('.') + '.IN-ADDR.ARPA';
        case 'ipv6':
            const parts: string[] = [];
            address.toNormalizedString().split(':').forEach((part: string) => {
                let i, pad = 4 - part.length;
                for (i = 0; i < pad; i++) {
                    part = '0' + part;
                }
                part.split('').forEach((p: any) => parts.push(p));
            });
            parts.reverse();
            return parts.join('.') + '.IP6.ARPA';
    }
}
