"use strict";

let LineStream = require("../../build/util/linestream").default;

describe("LineStream", () => {
  let linestream;

  beforeEach(() => {
    linestream = new LineStream();
  });

  function makeExpectTwoLines() {
    let n = 0;
    return (buf) => {
      if (n === 0) {
        expect(buf.toString("ASCII")).toEqual("Hello");
      } else if (n === 1) {
        expect(buf.toString("ASCII")).toEqual("World");
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
    linestream.on("data", (buf) => {
      fail("Received a line: " + buf.toString("ASCII"));
    });
    linestream.on("end", done);
    linestream.write("");
    linestream.end();
  });

  it("should transform a string without line-break", done => {
    let n = 0;
    linestream.on("data", buf => {
      expect(n).toBe(0);
      expect(buf.toString("ASCII")).toEqual("Hello");
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
});
