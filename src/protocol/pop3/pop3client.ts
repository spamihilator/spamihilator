"use strict";

import LineStream from "../../util/linestream";
import Message from "../../message/message";
import Pop3Protocol from "./pop3protocol";

/**
 * A client for POP3 message boxes
 * @author Michel Kraemer
 */
class Pop3Client extends Pop3Protocol {
  /**
   * True if the current request expects a multi-line response
   */
  private currentMultiline: boolean = false;

  /**
   * A handler that should be called when a response from the server has
   * been received
   */
  private currentHandler: (line: string, end: boolean) => void;

  /**
   * Will be called when an error has occurred. This is either a socket
   * error or an error returned by the server.
   */
  private errorHandler: (err: any) => void;

  /**
   * Handle response from the server and call the [current handler](#currenthandler)
   * @param line the response from the server
   */
  private handleLine(line: string) {
    let handler = this.currentHandler;
    if (this.currentMultiline) {
      if (line === ".\r\n") {
        // end of multi-line response. reset flag and finally call handler.
        this.currentMultiline = false;
        this.currentHandler = undefined;
        handler(line, true);
      } else {
        handler(line, false);
      }
    } else {
      if (line.substring(0, 3) !== "+OK") {
        // call error handler
        this.currentHandler = undefined;
        if (this.errorHandler) {
          this.errorHandler(line);
        }
      } else {
        // call current handler
        this.currentHandler = undefined;
        handler(line, true);
      }
    }
  }

  /**
   * Send a string to the server
   * @param str the string to send
   * @param listener will be called when the server has processed the
   * string successfully
   */
  private sendString(str: string, listener: (line: string, end: boolean) => void) {
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
  private sendLine(str: string, listener: (line: string, end: boolean) => void) {
    this.sendString(str + "\r\n", listener);
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
   * Set a listener that will be called when an error has occurred. This can
   * either be a socket error or an error returned by the server.
   * @param listener the listener
   */
  onError(listener: (err: any) => void) {
    this.errorHandler = listener;
    super.onError(listener);
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

  /**
   * Parse a response containing message ID and size
   * @param line the line to parse
   * @return a tuple containing parsed message ID and size
   */
  private parseIdAndSize(line: string): [number, number] {
    let v = line.split(/\s+/);
    if (v[0] === "+OK") {
      v.shift();
    }
    let id: number = undefined;
    let size: number = undefined;
    if (v.length > 0) {
      id = parseInt(v[0], 10);
    }
    if (v.length > 1) {
      size = parseInt(v[1], 10);
    }
    return [id, size];
  }

  /**
   * List the IDs and sizes of all messages in the mailbox
   * @param listener will be called when the list has been retrieved. Each
   * item in the list is a tuple of message ID and size.
   * @param id optional ID of a message to list
   */
  list(listener: (messages: Array<[number, number]>) => void, id?: number) {
    let cmd = "LIST";
    if (id !== undefined) {
      cmd += " " + id;
    }
    this.sendLine(cmd, line => {
      if (id !== undefined) {
        listener([this.parseIdAndSize(line)]);
      } else {
        this.currentMultiline = true;
        let result: Array<[number, number]> = [];
        this.currentHandler = (multiline, end) => {
          if (!end) {
            result.push(this.parseIdAndSize(multiline));
          } else {
            listener(result);
          }
        };
      }
    });
  }

  /**
   * Get information about the mailbox
   * @param listener will be called with the number of messages in the
   * mailbox and the total size
   */
  stat(listener: (messageCount: number, mailboxSize: number) => void) {
    this.sendLine("STAT", line => {
      let v = this.parseIdAndSize(line);
      listener(v[0], v[1]);
    });
  }

  /**
   * Retrieve a message by ID
   * @param id the ID of the message to retrieve
   * @param listener will be called with the parsed message
   */
  retr(id: number, listener: (msg: Message) => void) {
    this.sendLine("RETR " + id, () => {
      this.currentMultiline = true;
      let result = "";
      this.currentHandler = (line, end) => {
        if (!end) {
          result += line;
        } else {
          listener(new Message(result));
        }
      };
    });
  }
}

export default Pop3Client;
