"use strict";

let fs = require("fs");
let net = require("net");
let LineStream = require("../build/util/linestream").default;

/**
 * A mock for POP3 or IMAP clients
 * @author Michel Kraemer
 */
class MockClient {
  /**
   * Create the client and use the given fixture to simulate the connection
   * to the server
   * @param {string} host the host to connect to
   * @param {number} port the port to connect to
   * @param {string} fixture the path to the fixture containing the simulated
   * connection
   * @param listener a callback that will be called when the connection
   * has been simulated completely
   */
  create(host, port, fixture, listener) {
    // read fixture
    let lines = fs.readFileSync(fixture).toString("ASCII").split("\n");
    lines = lines.map(line => line.trim());
    while (lines[lines.length - 1] === "") {
      lines.pop();
    }

    // simulate messages from the client
    function sendClientMessage(socket) {
      while (true) {
        let str = lines[0];
        if (str.match(/^C:/)) {
          socket.write(str.substring(3) + "\r\n");
          lines.shift();
        } else {
          break;
        }
      }
    }

    this.socket = new net.Socket();
    let lineStream = new LineStream();
    lineStream.on("data", buf => {
      while (lines.length > 0) {
        let str = lines[0];
        if (str.match(/^S:/)) {
          expect(buf.toString("ASCII")).toBe(str.substring(3) + "\r\n");
          lines.shift();
        } else {
          break;
        }
      }
      if (lines.length > 0) {
        sendClientMessage(this.socket);
      } else {
        listener();
      }
    });
    this.socket.pipe(lineStream);
    this.socket.connect(port, host);
  }

  close() {
    this.socket.end();
  }
}

module.exports = MockClient;
