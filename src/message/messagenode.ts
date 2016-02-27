"use strict";

import * as Immutable from "immutable";
import MessageHeader from "./messageheader";
import MessageHeaderFieldType from "./messageheaderfieldtype";
import SubString from "../util/substring";

/**
 * A node in a MIME message
 * @author Michel Kraemer
 */
class MessageNode {
  private _header: MessageHeader;
  private _children: Immutable.List<MessageNode>;
  private _boundary: string;
  private _body: SubString;

  /**
   * Construct the node from a string
   * @param str the string to parse
   */
  constructor(msg: string) {
    this.loadMessage(msg, 0, this);
  }

  /**
   * Load the node from a string
   * @param msg the string to parse
   * @param pos the location in the string where the node starts
   * @param root the root node (or `this`)
   */
  private loadMessage(msg: string, pos: number, root: MessageNode): number {
    if (msg !== undefined) {
      pos = this.loadHeader(msg, pos);
      this.loadBoundary();
      pos = this.loadBody(msg, pos, root);
    }
    return pos;
  }

  /**
   * Load node header from a string
   * @param msg the string to parse
   * @param pos the location in the string where the header starts
   */
  private loadHeader(msg: string, pos: number): number {
    let fields: string[] = [];

    while (pos < msg.length) {
      // get line (BUGFIX: recognize header fields ending with '\n' instead of "\r\n")
      let rn = msg.indexOf("\n", pos);
      let n = rn + 1; // n points to the text after the line break
      if (rn > 0 && rn !== pos && msg[rn - 1] === "\r") {
        --rn;
      }

      if (rn < 0 || rn === pos) {
        // reached end of header
        break;
      }

      let line = msg.substring(pos, rn).trim();

      // long header field?
      while (n < msg.length && (msg[n] === "\t" || msg[n] === " ")) {
        ++n;

        // get next line
        let rn2 = msg.indexOf("\n", n);
        let n2 = rn2 + 1;
        if (rn2 > 0 && rn2 !== n && msg[rn2 - 1] === "\r") {
          --rn2;
        }

        if (rn2 < 0) {
          // reached end of message
          n2 = msg.length;
          rn2 = n2;
        }

        let line2 = msg.substring(n, rn2).trim();
        if (line2.length === 0) {
          // the second line was empty. suppose it's the end of the header
          // and set the current position right before the \n
          n = rn2;
          break;
        }

        line += " " + line2;
        n = n2;
      }

      fields.push(line);
      pos = n;
    }

    this._header = new MessageHeader(fields);
    return pos;
  }

  /**
   * Check if this node is a multipart node and get the boundary from
   * the `Content-Type` header field
   */
  private loadBoundary() {
    let content = this.getFieldByType(MessageHeaderFieldType.CONTENT_TYPE);
    if (content === undefined) {
      return;
    }

    let llcontent = content.toLowerCase();
    if (llcontent.indexOf("multipart") < 0) {
      return;
    }

    let bound = llcontent.indexOf("boundary");
    if (bound < 0) {
      return;
    }

    bound += "boundary".length;
    let start = content.indexOf("=", bound);
    if (start < 0) {
      start = bound;
    } else {
      start++;
    }

    let end = content.indexOf(";", start);
    if (end < 0) {
      end = content.length;
    }

    this._boundary = content.substring(start, end).trim();
    if ((this._boundary[0] === '"') && (this._boundary[this._boundary.length - 1] === '"')) {
      this._boundary = this._boundary.substring(1, this._boundary.length - 1);
    }
  }

  /**
   * Load node body from a string
   * @param str the string to parse
   * @param pos the location in the string where the body starts
   * @param root the MIME message's root node (or `this`)
   */
  private loadBody(msg: string, pos: number, root: MessageNode): number {
    // skip blank line
    if (pos + 1 < msg.length && msg[pos] === "\r" && msg[pos + 1] === "\n") {
      pos += 2;
    }

    let start = pos;
    let msglength = msg.length;
    this._body = new SubString(msg, start, msglength);
    let bodyReAssigned = false;

    while (pos + 1 < msglength) {
      // get line
      let rn = msg.indexOf("\r\n", pos);
      if (rn < 0) {
        rn = msglength;
      }
      let len = rn - pos;

      // reached end of body?
      if (msg[pos] === "-" && msg[pos + 1] === "-") {
        if (!bodyReAssigned) {
          // re-assign body, so that we don't include consecutive nodes
          this._body = new SubString(msg, start, pos);

          // set re-assigned flag, because we don't want to re-assign this
          // body again, if we find another node. This node is done.
          bodyReAssigned = true;
        }

        let bound = msg.substring(pos + 2, pos + len);
        pos += len + 2;

        let [nextNode, lastBoundary] = root.getNodeByBoundary(bound, false);
        if (lastBoundary) {
          return pos;
        }

        // was it really a new boundary?
        if (nextNode) {
          let child = new MessageNode("");
          if (nextNode._children === undefined) {
            nextNode._children = Immutable.List.of(child);
          } else {
            nextNode._children = nextNode._children.push(child);
          }
          pos = child.loadMessage(msg, pos, root);
        } else {
          // clear re-assign flag, because we did not find a new node
          // the following bytes still belong to the current node
          bodyReAssigned = false;
          this._body = new SubString(msg, start, msglength);
        }
      } else {
        pos += len + 2;
      }
    }

    return pos;
  }

  /**
   * Find a multipart node by its boundary
   * @param bound the boundary
   * @param lastBoundary true if the previous boundary marked the end of a node
   * @return a tuple containing the node found (may be `undefined`) and a boolean
   * specifying if the boundary found was the last one of a node
   */
  private getNodeByBoundary(bound: string, lastBoundary: boolean): [MessageNode, boolean] {
    if (this._boundary === undefined || this._boundary.length === 0 || !bound) {
      return [undefined, lastBoundary];
    }

    // is it exactly the boundary of this node?
    let llboundary = this._boundary.toLowerCase();
    let llbound = bound.toLowerCase();
    if (llboundary === llbound) {
      return [this, false];
    }

    // is it a boundary of a child?
    if (this._children !== undefined && this._children.size > 0) {
      let bilb = false;
      let childresult: MessageNode;
      this._children.forEach(child => {
        // TODO Node.js v5.5.0 does not support destructuring completely yet
        let [childresult2, bilb2] = child.getNodeByBoundary(bound, bilb);
        childresult = childresult2;
        bilb = bilb2;
        if (childresult) {
          return false;
        }
        return true;
      });
      if (childresult || bilb) {
        return [childresult, bilb];
      }
    }

    // is it the last body?
    let boundarylen = this._boundary.length;
    if (llbound.length >= boundarylen + 2 &&
        llbound.substring(0, boundarylen) === llboundary) {
      if ((bound[boundarylen + 0] === "-") &&
          (bound[boundarylen + 1] === "-")) {
        return [undefined, true];
      }

      // it is not the last one
      return [this, false];
    }

    // no node found
    return [undefined, lastBoundary];
  }

  /**
   * @return the node's header
   */
  get header(): MessageHeader {
    return this._header;
  }

  /**
   * @return the node's children (may be `undefined`)
   */
  get children(): Immutable.List<MessageNode> {
    return this._children;
  }

  /**
   * @return the node's body
   */
  get body(): SubString {
    return this._body;
  }

  /**
   * Get a field from the node's header
   * @param name the field's name
   * @return the field's body
   */
  getField(name: string): string {
    if (this._header === undefined) {
      return undefined;
    }
    return this._header.getField(name);
  }

  /**
   * Get a field from the node's header
   * @param type the field's type
   * @return the field's body
   */
  getFieldByType(type: MessageHeaderFieldType): string {
    if (this._header === undefined) {
      return undefined;
    }
    return this._header.getFieldByType(type);
  }
}

export default MessageNode;
