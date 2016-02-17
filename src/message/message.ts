"use strict";

import MessageNode from "./messagenode";

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
    return this.root;
  }
}

export default Message;
