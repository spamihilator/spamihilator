"use strict";

let Pop3Client = require("../../../build/protocol/pop3/pop3client").default;
let MockServer = require("../../mockserver");

describe("Pop3Client", () => {
  let client;
  let mockserver;

  beforeEach(() => {
    client = new Pop3Client();
    mockserver = new MockServer();
  });

  afterEach(() => {
    if (client) {
      client.destroy();
    }
  });

  it("should connect", done => {
    mockserver.create("test/protocol/pop3/fixtures/connect.log", address => {
      client.connect("localhost", address.port, () => {
        client.logout(done);
      });
    });
  });

  it("should login", done => {
    mockserver.create("test/protocol/pop3/fixtures/login.log", address => {
      client.connect("localhost", address.port, () => {
        client.login("username", "password", () => {
          client.logout(done);
        });
      });
    });
  });
});
