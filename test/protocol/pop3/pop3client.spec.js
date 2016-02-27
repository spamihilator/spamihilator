"use strict";

let Pop3Client = require("../../../build/protocol/pop3/pop3client").default;
let MockServer = require("../../mockserver");

describe("Pop3Client", () => {
  const FIXTURE_PATH = "test/protocol/pop3/fixtures/client/";
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
    if (mockserver) {
      mockserver.close();
    }
  });

  it("should connect", done => {
    mockserver.create(FIXTURE_PATH + "connect.log", address => {
      client.connect("localhost", address.port, () => {
        client.logout(done);
      });
    });
  });

  it("should login", done => {
    mockserver.create(FIXTURE_PATH + "login.log", address => {
      client.connect("localhost", address.port, () => {
        client.login("username", "password", () => {
          client.logout(done);
        });
      });
    });
  });

  it("should list message ids", done => {
    mockserver.create(FIXTURE_PATH + "list.log", address => {
      client.connect("localhost", address.port, () => {
        client.login("username", "password", () => {
          client.list(ids => {
            expect(ids).toEqual([[1, 100], [2, 200], [3, 123]]);
            client.logout(done);
          });
        });
      });
    });
  });

  it("should list a single message by id", done => {
    mockserver.create(FIXTURE_PATH + "list2.log", address => {
      client.connect("localhost", address.port, () => {
        client.login("username", "password", () => {
          client.list(ids => {
            expect(ids).toEqual([[2, 567]]);
            client.logout(done);
          }, 2);
        });
      });
    });
  });

  it("should get information about mailbox", done => {
    mockserver.create(FIXTURE_PATH + "stat.log", address => {
      client.connect("localhost", address.port, () => {
        client.login("username", "password", () => {
          client.stat((messageCount, mailboxSize) => {
            expect(messageCount).toBe(12);
            expect(mailboxSize).toBe(345);
            client.logout(done);
          });
        });
      });
    });
  });

  it("should retrieve a message", done => {
    mockserver.create(FIXTURE_PATH + "retr.log", address => {
      client.connect("localhost", address.port, () => {
        client.login("username", "password", () => {
          client.retr(1, msg => {
            expect(msg.header.getField("Subject")).toBe("Hi!");
            expect(msg.root.body.toString()).toBe("Hello World\r\n");
            client.logout(done);
          });
        });
      });
    });
  });
});
