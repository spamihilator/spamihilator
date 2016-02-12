/// <reference path="../../node_modules/immutable/dist/immutable.d.ts" />

"use strict";

import * as Immutable from "immutable";
import MessageHeaderField from "./messageheaderfield";
import MessageHeaderFieldType from "./messageheaderfieldtype";

/**
 * A MIME message header
 * @author Michel Kraemer
 */
class MessageHeader {
  /**
   * A list of all header fields
   */
  private _fields: Immutable.List<MessageHeaderField>;

  /**
   * A list of well-known header fields
   */
  private _knownFields: Immutable.Map<MessageHeaderFieldType, MessageHeaderField>;

  /**
   * Construct the message header
   * @param fields the header fields
   */
  constructor(fields: string[]) {
    this._fields = Immutable.List<MessageHeaderField>(
      fields.map(f => new MessageHeaderField(f)));
    this._knownFields = Immutable.Map<MessageHeaderFieldType, MessageHeaderField>(
      this._fields.map(f => [f.type, f]));
  }

  /**
   * Get the body of a header field by its name
   * @param name the name of the header field
   * @return the header field body
   */
  getField(name: string): string {
    let r = this._fields.find(f => f.name === name);
    return r && r.body;
  }

  /**
   * Get the body of a header fields by its type
   * @param type the type of the header field
   * @return the header field body
   */
  getFieldByType(type: MessageHeaderFieldType): string {
    let r = this._knownFields.get(type);
    return r && r.body;
  }

  /**
   * @return all header fields
   */
  get fields(): Immutable.List<MessageHeaderField> {
    return this._fields;
  }
}

export default MessageHeader;
