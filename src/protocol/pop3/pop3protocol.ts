/// <reference path="../../../typings/main/ambient/node/node.d.ts" />

"use strict";

import * as net from "net";

/**
 * Basic functionality for classes that communicate with peers using
 * the POP3 protocol
 * @author Michel Kraemer
 */
class Pop3Protocol {
  /**
   * The connection to the peer
   */
  protected socket: net.Socket = new net.Socket();

  /**
   * Destroy the connection to the peer immediately. Should only be called
   * on error. Otherwise the [end method](#end) should be used.
   */
  destroy() {
    this.socket.destroy();
  }

  /**
   * Gracefully shutdown the connection to the peer.
   */
  end() {
    this.socket.end();
  }

  /**
   * Set a listener that will be called when the connection has been closed
   * @param listener the listener
   */
  onClose(listener: (hadError: boolean) => void) {
    this.socket.on("close", listener);
  }

  /**
   * Set a listener that will be called when an error has occurred. This can
   * either be a socket error or an error returned by the server.
   * @param listener the listener
   */
  onError(listener: (err: any) => void) {
    this.socket.on("error", listener);
  }

  /**
   * Set a listener that will be called when the connection has timed out
   * @param listener the listener
   */
  onTimeout(listener: () => void) {
    this.socket.on("timeout", listener);
  }
}

export default Pop3Protocol;
