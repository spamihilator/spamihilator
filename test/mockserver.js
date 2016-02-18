"use strict";

let fs = require("fs");
let net = require("net");

/**
 * A mock for POP3 or IMAP servers
 * @author Michel Kraemer
 */
class MockServer {
  /**
   * Create the server and use the given fixture to simulate the connection
   * to the server
   * @param {string} fixture the path to the fixture containing the simulated
   * connection
   * @param listener a callback that will be called when the server is ready
   */
  create(fixture, listener) {
    // read fixture
    let lines = fs.readFileSync(fixture).toString("ASCII").split("\n");
    lines = lines.map(line => line.trim());

    // simulate messages from the server
    function sendServerMessage(socket) {
      while (true) {
        let str = lines[0];
        if (str.match(/^S:/)) {
          socket.write(str.substring(3) + "\r\n");
          lines.shift();
        } else {
          break;
        }
      }
    }

    this.server = net.createServer((socket) => {
      // receive data from the client and respond
      socket.on("data", buf => {
        let str = lines.shift();
        if (str.match(/^C:/)) {
          expect(buf.toString("ASCII")).toBe(str.substring(3) + "\r\n");
          sendServerMessage(socket);
        }
      });
      sendServerMessage(socket);
    });

    // listen to incoming connections
    this.server.listen(() => {
      listener(this.server.address());
    });
  }

  close() {
    this.server.close();
  }
}

module.exports = MockServer;
