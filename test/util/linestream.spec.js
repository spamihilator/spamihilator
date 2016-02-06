"use strict";

let LineStream = require("../../build/util/linestream").default;

describe("LineStream", () => {
  let linestream;

  beforeEach(() => {
    linestream = new LineStream();
  });

  function makeExpectTwoLines(first, second) {
    first = first !== undefined ? first : "Hello\n";
    second = second !== undefined ? second : "World\n";
    let n = 0;
    return (buf) => {
      if (n === 0) {
        expect(buf.toString("ASCII")).toBe(first);
      } else if (n === 1) {
        expect(buf.toString("ASCII")).toBe(second);
      } else {
        fail("Too many lines");
      }
      ++n;
    };
  }

  it("should transform empty stream", done => {
    linestream.on("data", (buf) => {
      fail("Received a line: " + buf.toString("ASCII"));
    });
    linestream.on("end", done);
    linestream.end();
  });

  it("should transform empty string", done => {
    let n = 0;
    linestream.on("data", (buf) => {
      expect(n).toBe(0);
      expect(buf.toString("ASCII")).toBe("\n");
      ++n;
    });
    linestream.on("end", done);
    linestream.write("");
    linestream.end();
  });

  it("should transform a string without line-break", done => {
    let n = 0;
    linestream.on("data", buf => {
      expect(n).toBe(0);
      expect(buf.toString("ASCII")).toBe("Hello\n");
      ++n;
    });
    linestream.on("end", done);
    linestream.write("Hello");
    linestream.end();
  });

  it("should transform two lines", done => {
    linestream.on("data", makeExpectTwoLines());
    linestream.on("end", done);
    linestream.write("Hello\nWorld\n");
    linestream.end();
  });

  it("should transform two separate lines", done => {
    linestream.on("data", makeExpectTwoLines());
    linestream.on("end", done);
    linestream.write("Hello\n");
    linestream.write("World\n");
    linestream.end();
  });

  it("should transform two lines without final line-break", done => {
    linestream.on("data", makeExpectTwoLines());
    linestream.on("end", done);
    linestream.write("Hello\n");
    linestream.write("World");
    linestream.end();
  });

  it("should transform four chunks", done => {
    linestream.on("data", makeExpectTwoLines());
    linestream.on("end", done);
    linestream.write("Hell");
    linestream.write("o\n");
    linestream.write("Wor");
    linestream.write("ld");
    linestream.end();
  });

  it("should transform empty line", done => {
    linestream.on("data", makeExpectTwoLines("\n", "hello\n"));
    linestream.on("end", done);
    linestream.write("\n");
    linestream.write("hello\n");
    linestream.end();
  });

  it("should transform empty line at the end", done => {
    linestream.on("data", makeExpectTwoLines("hello\n", "\n"));
    linestream.on("end", done);
    linestream.write("hello\n\n");
    linestream.end();
  });
});
