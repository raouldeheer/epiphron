import { createSocket, RemoteInfo, Socket as dgramSocket, SocketType } from 'dgram';
import { EventEmitter } from 'events';
import * as net from 'net';
import { UDPSocket, TCPSocket, Socket } from './sockets';
import { dnsRequest } from './requestTypes';
import DataPacket from './packet/DataPacket';

class Server extends EventEmitter {
    socket: net.Server | dgramSocket;
    constructor(socket: net.Server | dgramSocket) {
        super();
        this.socket = socket;
        this.socket.on('listening', () => {
            this.emit('listening');
        });
        this.socket.on('close', () => {
            this.emit('close');
        });
        this.socket.on('error', (err: Error) => {
            console.error(err);
            this.emit('socketError', err, this.socket);
        });
        this.socket.on("close", (err: Error) => {
            console.error(err);
        });
        this.socket.on("timeout", (err: Error) => {
            console.error(err);
        });
        this.socket.on("end", (err: Error) => {
            console.error(err);
        });
    }
    handleMessage(msg: Buffer, remote: Socket, address: net.AddressInfo) {
        const response = new DataPacket(remote);
        try {
            const request: dnsRequest = {
                address: address,
                ...DataPacket.parse(msg, remote)
            };
            response.header.id = request.header.id;
            response.header.qr = 1;
            response.question = request.question;
            this.emit('request', request, response);
        } catch (e) {
            this.emit('error', e, msg, response);
        }
    }
}

class UDPServer extends Server {
    constructor(opts: { dgram_type: SocketType; }) {
        super(createSocket(opts.dgram_type || 'udp4'));
        this.socket = this.socket as dgramSocket;
        this.socket.on('message', (msg: Buffer, remote: RemoteInfo) => {
            this.handleMessage(msg, new UDPSocket(this.socket as dgramSocket, remote), remote);
        });
    }
    serve(port: number, address?: string, callback?: () => void) {
        this.socket = this.socket as dgramSocket;
        this.socket.bind(port, address, callback);
    }
}

class TCPServer extends Server {
    constructor() {
        super(net.createServer((client: net.Socket) => {
            const tcp = new TCPSocket(client);
            const address = client.address() as net.AddressInfo;
            tcp.on('message', (msg: Buffer, _remote: TCPSocket): void => {
                this.handleMessage(msg, tcp, address);
            });
            tcp.catchMessages();
        }));
    }
    serve(port: number, address: string, callback?: () => void) {
        this.socket = this.socket as net.Server;
        this.socket.listen(port, address, callback);
    }
}

export function createServer(opts?: any) {
    return new UDPServer(opts || {});
}

export function createTCPServer() {
    return new TCPServer();
}
