"use strict";

let Pop3Server = require("../../../build/protocol/pop3/pop3server").default;
let MockClient = require("../../mockclient");

describe("Pop3Server", () => {
  const FIXTURE_PATH = "test/protocol/pop3/fixtures/server/";
  let server;
  let host;
  let port;
  let mockclient;

  beforeEach(done => {
    server = new Pop3Server("localhost", 0, err => {
      host = server.address().host;
      port = server.address().port;
      done(err);
    });
    mockclient = new MockClient();
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
    if (mockclient) {
      mockclient.close();
    }
  });

  it("should connect", done => {
    mockclient.create(host, port, FIXTURE_PATH + "connect.log", done);
  });
});
