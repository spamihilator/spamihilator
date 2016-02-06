"use strict";

let MessageHeaderField = require("../../build/message/messageheaderfield").default;
let MessageHeaderFieldType = require("../../build/message/messageheaderfieldtype").default;

describe("MessageHeaderField", () => {
  it("should parse valid field", () => {
    let field = new MessageHeaderField("Subject: Hello World");
    expect(field.name).toBe("Subject");
    expect(field.body).toBe("Hello World");
    expect(field.type).toBe(MessageHeaderFieldType.SUBJECT);
  });

  it("should parse field with spaces and tabs", () => {
    let field = new MessageHeaderField(" \t From \t:\tHello World   ");
    expect(field.name).toBe("From");
    expect(field.body).toBe("Hello World");
    expect(field.type).toBe(MessageHeaderFieldType.FROM);
  });

  it("should parse field without space", () => {
    let field = new MessageHeaderField("To:Hello World");
    expect(field.name).toBe("To");
    expect(field.body).toBe("Hello World");
    expect(field.type).toBe(MessageHeaderFieldType.TO);
  });

  it("should parse lower and upper case", () => {
    let field = new MessageHeaderField("sUbJeCT:Hello World");
    expect(field.name).toBe("sUbJeCT");
    expect(field.body).toBe("Hello World");
    expect(field.type).toBe(MessageHeaderFieldType.SUBJECT);
  });

  it("should parse any field", () => {
    let field = new MessageHeaderField("X-Unknown: Hello World");
    expect(field.name).toBe("X-Unknown");
    expect(field.body).toBe("Hello World");
    expect(field.type).toBe(MessageHeaderFieldType.DEFAULT);
  });

  it("should not parse invalid field", () => {
    let field = new MessageHeaderField("Subject");
    expect(field.name).toBeUndefined();
    expect(field.body).toBeUndefined();
    expect(field.type).toBeUndefined();
  });

  it("should not parse empty field", () => {
    let field = new MessageHeaderField("");
    expect(field.name).toBeUndefined();
    expect(field.body).toBeUndefined();
    expect(field.type).toBeUndefined();
  });

  it("should not parse undefined field", () => {
    let field = new MessageHeaderField(undefined);
    expect(field.name).toBeUndefined();
    expect(field.body).toBeUndefined();
    expect(field.type).toBeUndefined();
  });
});
