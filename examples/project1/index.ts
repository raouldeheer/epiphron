import dns, { DataPacket, dnsRequest } from "../../dist/index";

const handleRequest = async (request: dnsRequest, response: DataPacket): Promise<void> => {
    console.log(request.question[0]);

    // Add all authority records
    response.authority.push(new dns.records.SOA({
        name: request.question[0].name,
        ttl: 600,
        primary: "ns.example.com",
        admin: "admin@example.com",
        serial: 123456,
        refresh: 600,
        retry: 600,
        expiration: 600,
        minimum: 600,
    }));
    response.authority.push(new dns.records.NS({
        name: request.question[0].name,
        data: "ns.example.com",
        ttl: 600,
    }));
    response.additional.push(new dns.records.A({
        name: "ns.example.com",
        address: "123.123.123.123",
        ttl: 600,
    }));

    response.answer.push(new dns.records.A({
        name: request.question[0].name,
        address: "123.123.123.123",
        ttl: 600,
    }));

    response.send();
};

const tcpserver = dns.createTCPServer();
tcpserver.on('request', handleRequest);
tcpserver.on('error', (err: Error, msg: Buffer, response: DataPacket) => {
    console.log(err.stack);
});
tcpserver.serve(53, '0.0.0.0', () => { console.log('Listening on ' + 53 + ' tcp'); });

const udpserver = dns.createServer();
udpserver.on('request', handleRequest);
udpserver.on('error', (err: Error, msg: Buffer, response: DataPacket) => {
    console.log(err.stack);
});
udpserver.serve(53, '0.0.0.0', () => { console.log('Listening on ' + 53 + ' udp'); });
