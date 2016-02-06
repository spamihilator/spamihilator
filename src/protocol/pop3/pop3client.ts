/// <reference path="../../../typings/main/ambient/node/node.d.ts" />

"use strict";

import * as net from "net";
import LineStream from "../../util/linestream";

/**
 * A client for POP3 message boxes
 * @author Michel Kraemer
 */
class Pop3Client {
  /**
   * A handler that should be called when a response from the server has
   * been received
   */
  private currentHandler: () => void;

  /**
   * Will be called when an error has occurred. This is either a socket
   * error or an error returned by the server.
   */
  private errorHandler: (err: any) => void;

  /**
   * The connection to the server
   */
  private socket: net.Socket = new net.Socket();

  /**
   * Handle response from the server and call the [current handler](#currenthandler)
   * @param line the response from the server
   */
  private handleLine(line: string) {
    if (line.substring(0, 3) !== "+OK") {
      // call error handler
      this.currentHandler = undefined;
      if (this.errorHandler) {
        this.errorHandler(line);
      }
    } else if (this.currentHandler) {
      // call current handler
      let handler = this.currentHandler;
      this.currentHandler = undefined;
      handler();
    }
  }

  /**
   * Send a string to the server
   * @param str the string to send
   * @param listener will be called when the server has processed the
   * string successfully
   */
  private sendString(str: string, listener: () => void) {
    let buf = new Buffer(str, "ASCII");
    this.currentHandler = listener;
    this.socket.write(buf);
  }

  /**
   * Append a line break to a string and then send it to the server
   * @param str the string to send (a line break will be appended)
   * @param listener will be called when the server has processed the
   * string successfully
   */
  private sendLine(str: string, listener: () => void) {
    this.sendString(str + "\n", listener);
  }

  /**
   * Connect to a POP3 server
   * @param host the server to connect to
   * @param port the port to connect to
   * @param listener will be called when the connection has been established
   * successfully and the server accepts commands
   */
  connect(host: string, port: number, listener: () => void) {
    this.currentHandler = listener;
    let lineStream = new LineStream();
    lineStream.on("data", (buf: Buffer | string) =>
      this.handleLine(buf.toString("ASCII")));
    this.socket.pipe(lineStream);
    this.socket.connect(port, host);
  }

  /**
   * Destroy the connection to the server immediately. Should only be called
   * on error. Otherwise the [end method](#end) should be used.
   */
  destroy() {
    this.socket.destroy();
  }

  /**
   * Gracefully shutdown the connection to the server without logging out.
   * If you want to log out before closing the connection call the
   * [logout method](#logout) first.
   */
  end() {
    this.socket.end();
  }

  /**
   * Set a listener that will be called when the connection has been closed
   * @param listener the listener
   */
  onClose(listener: (hadError: boolean) => void) {
    this.socket.on("close", listener);
  }

  /**
   * Set a listener that will be called when an error has occurred. This can
   * either be a socket error or an error returned by the server.
   * @param listener the listener
   */
  onError(listener: (err: any) => void) {
    this.errorHandler = listener;
    this.socket.on("error", listener);
  }

  /**
   * Set a listener that will be called when the connection has timed out
   * @param listener the listener
   */
  onTimeout(listener: () => void) {
    this.socket.on("timeout", listener);
  }

  /**
   * Log in to a mailbox using the given credentials (username and password)
   * @param username the username
   * @param password the password
   * @param listener will be called when the log in was successful
   */
  login(username: string, password: string, listener: () => void) {
    this.sendLine("USER " + username, () => {
      this.sendLine("PASS " + password, listener);
    });
  }

  /**
   * Log out from the mailbox
   * @param listener will be called when the log out was successful
   */
  logout(listener?: () => void) {
    listener = listener || (() => { /* empty */ });
    this.sendLine("QUIT", listener);
  }

  /**
   * Send a NOOP command. The command does nothing. Send it to keep the
   * connection open.
   * @param listener will be called when the server has processed the command
   */
  noop(listener?: () => void) {
    listener = listener || (() => { /* empty */ });
    this.sendLine("NOOP", listener);
  }

  /**
   * Delete a message from the mailbox
   * @param id the message id
   * @param listener will be called when the message has been deleted
   * successfully
   */
  delete(id: number, listener: () => void) {
    this.sendLine("DELETE " + id, listener);
  }
}

export default Pop3Client;
