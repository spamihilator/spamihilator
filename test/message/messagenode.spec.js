"use strict";

let MessageNode = require("../../build/message/messagenode").default;
let MessageHeaderFieldType = require("../../build/message/messageheaderfieldtype").default;

describe("MessageNode", () => {
  it("should parse undefined string", () => {
    let node = new MessageNode(undefined);
    expect(node.header).toBe(undefined);
    expect(node.children).toBe(undefined);
    expect(node.body).toBe(undefined);
  });

  it("should parse empty string", () => {
    let node = new MessageNode("");
    expect(node.header.fields.size).toBe(0);
    expect(node.children).toBe(undefined);
    expect(node.body.length).toBe(0);
  });

  it("should parse header only", () => {
    let node = new MessageNode("Subject: Test\r\n");
    expect(node.header.fields.size).toBe(1);
    expect(node.header.getField("Subject")).toBe("Test");
    expect(node.header.getFieldByType(MessageHeaderFieldType.SUBJECT)).toBe("Test");
    expect(node.children).toBe(undefined);
    expect(node.body.length).toBe(0);
  });

  it("should parse simple message", () => {
    let node = new MessageNode("Subject: Test\r\n\r\nHello World!");
    expect(node.header.fields.size).toBe(1);
    expect(node.header.getFieldByType(MessageHeaderFieldType.SUBJECT)).toBe("Test");
    expect(node.children).toBe(undefined);
    expect(node.body.save()).toBe("Hello World!");
  });

  it("should parse message with child node", () => {
    let node = new MessageNode("Subject: Test\r\n" +
      "Content-Type: multipart; boundary=\"----part\"\r\n" +
      "\r\n" +
      "Root\r\n" +
      "------part\r\n" +
      "Content-Type: text/plain\r\n" +
      "\r\n" +
      "Child\r\n" +
      "------part--");
    expect(node.header.fields.size).toBe(2);
    expect(node.header.getFieldByType(MessageHeaderFieldType.SUBJECT)).toBe("Test");
    expect(node.header.getFieldByType(MessageHeaderFieldType.CONTENT_TYPE))
      .toBe("multipart; boundary=\"----part\"");
    expect(node.children.size).toBe(1);
    expect(node.body.save()).toBe("Root\r\n");
    expect(node.children.get(0).header.fields.size).toBe(1);
    expect(node.children.get(0).header.getFieldByType(
      MessageHeaderFieldType.CONTENT_TYPE)).toBe("text/plain");
    expect(node.children.get(0).body.save()).toBe("Child\r\n");
    expect(node.children.get(0).children).toBeUndefined();
  });

  it("should parse message with multiple child nodes", () => {
    let node = new MessageNode("Subject: Test\r\n" +
      "Content-Type: multipart/mixed; boundary=\"----part\"\r\n" +
      "\r\n" +
      "Root\r\n" +
      "------part\r\n" +
      "\r\n" +
      "Child 1\r\n" +
      "------part\r\n" +
      "Content-Type: multipart/parallel; boundary=----part2\r\n" +
      "\r\n" +
      "------part2\r\n" +
      "Content-Type: text/plain\r\n" +
      "\r\n" +
      "Child 2.2\r\n" +
      "------part2\r\n" +
      "Content-Type: text/richtext\r\n" +
      "\r\n" +
      "Child 2.3\r\n" +
      "------part2--\r\n" +
      "\r\n" +
      "------part\r\n" +
      "Content-Type: text/html\r\n" +
      "\r\n" +
      "<em>Child 3</em>\r\n" +
      "------part--");
    expect(node.header.fields.size).toBe(2);
    expect(node.header.getFieldByType(MessageHeaderFieldType.SUBJECT)).toBe("Test");
    expect(node.header.getFieldByType(MessageHeaderFieldType.CONTENT_TYPE))
      .toBe("multipart/mixed; boundary=\"----part\"");
    expect(node.children.size).toBe(3);
    expect(node.body.save()).toBe("Root\r\n");
    let child0 = node.children.get(0);
    let child1 = node.children.get(1);
    let child2 = node.children.get(2);
    expect(child0.header.fields.size).toBe(0);
    expect(child0.body.save()).toBe("Child 1\r\n");
    expect(child0.children).toBeUndefined();
    expect(child1.header.fields.size).toBe(1);
    expect(child1.header.getFieldByType(MessageHeaderFieldType.CONTENT_TYPE))
      .toBe("multipart/parallel; boundary=----part2");
    expect(child1.body.save()).toBe("");
    expect(child1.children.size).toBe(2);
    let child10 = child1.children.get(0);
    let child11 = child1.children.get(1);
    expect(child10.header.fields.size).toBe(1);
    expect(child10.header.getFieldByType(
      MessageHeaderFieldType.CONTENT_TYPE)).toBe("text/plain");
    expect(child10.body.save()).toBe("Child 2.2\r\n");
    expect(child10.children).toBeUndefined();
    expect(child11.header.fields.size).toBe(1);
    expect(child11.header.getFieldByType(MessageHeaderFieldType.CONTENT_TYPE))
      .toBe("text/richtext");
    expect(child11.body.save()).toBe("Child 2.3\r\n");
    expect(child11.children).toBeUndefined();
    expect(child2.header.fields.size).toBe(1);
    expect(child2.header.getFieldByType(MessageHeaderFieldType.CONTENT_TYPE))
      .toBe("text/html");
    expect(child2.body.save()).toBe("<em>Child 3</em>\r\n");
    expect(child2.children).toBeUndefined();
  });
});
