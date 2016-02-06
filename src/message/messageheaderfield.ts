"use strict";

import MessageHeaderFieldType from "./messageheaderfieldtype";

/**
 * A field in a message header
 * @author Michel Kraemer
 */
class MessageHeaderField {
  private _name: string;
  private _body: string;
  private _type: MessageHeaderFieldType;

  /**
   * Parse the message header field
   * @param field the field to parse
   */
  constructor(field: string) {
    if (!field) {
      return;
    }

    let colon = field.indexOf(":");
    if (colon < 0) {
      return;
    }

    this._name = field.substring(0, colon).trim();
    this._body = field.substring(colon + 1).trim();

    let upperName = this._name.toUpperCase();
    if (upperName === "TO") {
      this._type = MessageHeaderFieldType.TO;
    } else if (upperName === "FROM") {
      this._type = MessageHeaderFieldType.FROM;
    } else if (upperName === "CONTENT-TYPE") {
      this._type = MessageHeaderFieldType.CONTENT_TYPE;
    } else if (upperName === "BCC") {
      this._type = MessageHeaderFieldType.BCC;
    } else if (upperName === "CC") {
      this._type = MessageHeaderFieldType.CC;
    } else if (upperName === "SUBJECT") {
      this._type = MessageHeaderFieldType.SUBJECT;
    } else if (upperName === "DATE") {
      this._type = MessageHeaderFieldType.DATE;
    } else {
      this._type = MessageHeaderFieldType.DEFAULT;
    }
  }

  /**
   * @return the field name
   */
  get name() {
    return this._name;
  }

  /**
   * @return the field body
   */
  get body() {
    return this._body;
  }

  /**
   * @return the field type
   */
  get type() {
    return this._type;
  }
}

export default MessageHeaderField;
