/// <reference path="../../../typings/main/ambient/node/node.d.ts" />

"use strict";

import * as net from "net";
import Pop3ServerConnection from "./pop3serverconnection";

/**
 * A POP3 server
 * @author Michel Kraemer
 */
class Pop3Server {
  /**
   * The server
   */
  private server: net.Server;

  /**
   * Create a new POP3 server
   * @param host the host to listen on
   * @param port the port to listen to
   */
  constructor(host: string, port: number, callback: (err: any) => void) {
    this.server = net.createServer(socket => {
      let conn = new Pop3ServerConnection(socket);
      conn.greet();
    });
    this.server.listen({ host, port, exclusive: true }, callback);
  }

  /**
   * Stops the server from accepting connections
   */
  close() {
    this.server.close();
  }

  /**
   * @return the bound address, the address family name and port of the server
   */
  address(): { port: number; family: string; address: string } {
    return this.server.address();
  }
}

export default Pop3Server;
