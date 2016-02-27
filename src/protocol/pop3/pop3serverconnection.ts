/// <reference path="../../../typings/main/ambient/node/node.d.ts" />

"use strict";

import * as net from "net";
import LineStream from "../../util/linestream";
import Pop3Protocol from "./pop3protocol";

/**
 * A connection from a POP3 server to a POP3 client
 * @author Michel Kraemer
 */
class Pop3ServerConnection extends Pop3Protocol {
  /**
   * Construct a new connection to a POP3 client
   * @param socket the socket used to communicate with the client
   */
  constructor(socket: net.Socket) {
    super();
    this.socket = socket;
    let lineStream = new LineStream();
    lineStream.on("data", (buf: Buffer | string) =>
      this.handleLine(buf.toString("ASCII")));
    this.socket.pipe(lineStream);
  }

  /**
   * Handle request from the client
   * @param line the request from the client
   */
  private handleLine(line: string) {
    line = line.trim();
    let parts = line.split(/\s+/);
    let cmd = parts[0].toUpperCase();
    if (cmd === "QUIT") {
      this.onQuit();
    } else {
      this.sendERR("Unknown command or syntax error");
    }
  }

  /**
   * Send a string to the client
   * @param str the string to send
   */
  private sendString(str: string) {
    let buf = new Buffer(str, "ASCII");
    this.socket.write(buf);
  }

  /**
   * Append a line break to a string and then send it to the client
   * @param str the string to send (a line break will be appended)
   */
  private sendLine(str: string) {
    this.sendString(str + "\r\n");
  }

  /**
   * Send a message to the client signaling that the last request
   * was processed successfully. Depending on the request more data
   * might be sent to the client.
   * @param msg the message to include in the response
   */
  private sendOK(msg: string) {
    this.sendLine("+OK " + msg);
  }

  /**
   * Send an error message to the client
   * @param msg the error message
   */
  private sendERR(msg: string) {
    this.sendLine("-ERR " + msg);
  }

  /**
   * Destroy the connection to the client immediately. Should only be called
   * on error. Otherwise the [end method](#end) should be used.
   */
  destroy() {
    this.socket.destroy();
  }

  /**
   * Gracefully shutdown the connection to the client
   */
  end() {
    this.socket.end();
  }

  /**
   * Send greeting to the client
   */
  greet() {
    this.sendLine("+OK Spamihilator");
  }

  /**
   * Will be called when a QUIT request has been received from the client
   */
  private onQuit() {
    this.sendOK("They're shutting us down, Scully ...");
    this.end();
  }
}

export default Pop3ServerConnection;
