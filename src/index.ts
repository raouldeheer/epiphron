import DataPacket from "./packet/DataPacket";
import * as records from "./records/index";
import { createServer, createTCPServer } from "./servers";
export { Question, dnsRequest } from "./requestTypes";

export { DataPacket, records };

const dns = {
    records,
    createServer,
    createTCPServer
}

export default dns;
