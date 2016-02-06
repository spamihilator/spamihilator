/// <reference path="../../typings/main/ambient/node/node.d.ts" />

"use strict";

import * as stream from "stream";

/**
 * Transform input chunks to lines
 * @author Michel Kraemer
 */
class LineStream extends stream.Transform {
  private static LF = "\n";
  private line: string = undefined;

  constructor(options?: any) {
    super(options);
  }

  private normalize(str: string) {
    return str.replace(/[\r\n]+$/, "") + "\n";
  }

  private pushLine() {
    if (this.line !== undefined) {
      this.push(this.normalize(this.line));
      this.line = undefined;
    }
  }

  _transform(chunk: Buffer | string, encoding: string, callback: Function) {
    let str = chunk.toString("ASCII");
    while (true) {
      // look for line end
      let n = str.indexOf(LineStream.LF);
      if (n < 0) {
        // no line end found. wait for next chunk.
        if (this.line === undefined) {
          this.line = str;
        } else {
          this.line += str;
        }
        break;
      } else {
        // line end found. emit line.
        let s = str.slice(0, n + 1);
        if (this.line === undefined) {
          this.line = s;
        } else {
          this.line += s;
        }
        str = str.slice(n + 1);
        this.pushLine();
      }
    }

    callback();
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
