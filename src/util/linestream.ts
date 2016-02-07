/// <reference path="../../typings/main/ambient/node/node.d.ts" />

"use strict";

import * as stream from "stream";

/**
 * Transform input chunks to lines
 * @author Michel Kraemer
 */
class LineStream extends stream.Transform {
  private static CRLF = "\r\n";
  private line: string = undefined;

  constructor() {
    super({ objectMode: true });
  }

  private pushLine() {
    if (this.line !== undefined) {
      this.push(this.line);
      this.line = undefined;
    }
  }

  _transform(chunk: Buffer | string, encoding: string, callback: Function) {
    let str = chunk.toString("ASCII");

    let pos = 0;
    while (true) {
      // look for line end
      let n = str.indexOf(LineStream.CRLF, pos);
      if (n < 0) {
        // no line end found. wait for next chunk.
        if (this.line === undefined) {
          this.line = str.substring(pos);
        } else {
          this.line += str.substring(pos);
        }
        break;
      } else {
        // line end found. emit line.
        let s = str.substring(pos, pos + n + 2);
        if (this.line === undefined) {
          this.line = s;
        } else {
          this.line += s;
        }
        pos += n + 2;
        this.pushLine();
      }
    }

    if (callback) {
      callback();
    }
  }

  _flush(callback: Function) {
    // emit rest of buffer contents
    if (this.line !== undefined && this.line !== "") {
      this.pushLine();
    }
    if (callback) {
      callback();
    }
  }
}

export default LineStream;
