"use strict";

import MessageNode from "./messagenode";
import MessageHeader from "./messageheader";

/**
 * Represents a MIME message
 * @author Michel Kraemer
 */
class Message {
  private _root: MessageNode;

  /**
   * Construct a new message
   * @param msg the message contents
   */
  constructor(msg: string) {
    this._root = new MessageNode(msg);
  }

  /**
   * @return the message's root node
   */
  get root(): MessageNode {
    return this._root;
  }

  /**
   * @return the message's header
   */
  get header(): MessageHeader {
    return this._root && this._root.header;
  }
}

export default Message;
