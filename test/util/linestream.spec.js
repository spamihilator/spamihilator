"use strict";

let LineStream = require("../../build/util/linestream").default;

describe("LineStream", () => {
  let linestream;

  beforeEach(() => {
    linestream = new LineStream();
  });

  function makeExpectLines(first, second, third) {
    first = first !== undefined ? first : "Hello\r\n";
    second = second !== undefined ? second : "World\r\n";
    let n = 0;
    return line => {
      if (n === 0) {
        expect(line).toBe(first);
      } else if (n === 1) {
        expect(line).toBe(second);
      } else {
        if (third !== undefined && n === 2) {
          expect(line).toBe(third);
        } else {
          fail("Extra line: '" + line + "'");
        }
      }
      ++n;
    };
  }

  it("should transform empty stream", done => {
    linestream.on("data", line => {
      fail("Received a line: " + line);
    });
    linestream.on("end", done);
    linestream.end();
  });

  it("should transform empty string", done => {
    let n = 0;
    linestream.on("data", line => {
      expect(n).toBe(0);
      expect(line).toBe("");
      ++n;
    });
    linestream.on("end", done);
    linestream.write("");
    linestream.end();
  });

  it("should transform a string without line-break", done => {
    let n = 0;
    linestream.on("data", line => {
      expect(n).toBe(0);
      expect(line).toBe("Hello");
      ++n;
    });
    linestream.on("end", done);
    linestream.write("Hello");
    linestream.end();
  });

  it("should transform two lines", done => {
    linestream.on("data", makeExpectLines());
    linestream.on("end", done);
    linestream.write("Hello\r\nWorld\r\n");
    linestream.end();
  });

  it("should transform three lines", done => {
    linestream.on("data", makeExpectLines(undefined, undefined, "Foo\r\n"));
    linestream.on("end", done);
    linestream.write("Hello\r\nWorld\r\nFoo\r\n");
    linestream.end();
  });

  it("should transform two separate lines", done => {
    linestream.on("data", makeExpectLines());
    linestream.on("end", done);
    linestream.write("Hello\r\n");
    linestream.write("World\r\n");
    linestream.end();
  });

  it("should transform two lines without final line-break", done => {
    linestream.on("data", makeExpectLines(undefined, "World"));
    linestream.on("end", done);
    linestream.write("Hello\r\n");
    linestream.write("World");
    linestream.end();
  });

  it("should transform four chunks", done => {
    linestream.on("data", makeExpectLines(undefined, "World"));
    linestream.on("end", done);
    linestream.write("Hell");
    linestream.write("o\r\n");
    linestream.write("Wor");
    linestream.write("ld");
    linestream.end();
  });

  it("should transform empty line", done => {
    linestream.on("data", makeExpectLines("\r\n", "hello\r\n"));
    linestream.on("end", done);
    linestream.write("\r\n");
    linestream.write("hello\r\n");
    linestream.end();
  });

  it("should transform empty line at the end", done => {
    linestream.on("data", makeExpectLines("hello\r\n", "\r\n"));
    linestream.on("end", done);
    linestream.write("hello\r\n\r\n");
    linestream.end();
  });
});
