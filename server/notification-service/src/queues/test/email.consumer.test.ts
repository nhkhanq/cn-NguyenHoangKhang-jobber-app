import * as connection from "@notification/queues/connection";
import amqp from "amqplib";
import {
  consumeAuthEmailMessages,
  consumeOrderEmailMessages,
} from "@notification/queues/email.consumer";

jest.mock("@notification/queues/connection");
jest.mock("amqplib");
jest.mock("jobber-shared-for-hkhanq");

describe("Email Consumer", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("consumeAuthEmailMessages method", () => {
    it("should be called", async () => {
      const channel = {
        assertExchange: jest.fn(),
        publish: jest.fn(),
        bindQueue: jest.fn(),
        assertQueue: jest.fn().mockReturnValue({
          queue: "auth-email-queue",
          messageCount: 0,
          consumerCount: 0,
        }),
        consume: jest.fn(),
      };

      jest
        .spyOn(connection, "createConnection")
        .mockReturnValue(channel as any);

      const connectionChannel: amqp.Channel | undefined =
        await connection.createConnection();
      await consumeAuthEmailMessages(connectionChannel!);
      expect(connectionChannel!.assertExchange).toHaveBeenCalledWith(
        "jobber-email-notification",
        "direct"
      ),
        expect(connectionChannel!.assertQueue).toHaveBeenCalledTimes(1),
        expect(connectionChannel!.bindQueue).toHaveBeenCalledWith(
          "auth-email-queue",
          "jobber-email-notification",
          "auth-email"
        );
    });
  });

  describe("consumeOrderEmailMessages method", () => {
    it("should be called", async () => {
      const channel = {
        assertExchange: jest.fn(),
        publish: jest.fn(),
        bindQueue: jest.fn(),
        assertQueue: jest.fn().mockReturnValue({
          queue: "order-email-queue",
          messageCount: 0,
          consumerCount: 0,
        }),
        consume: jest.fn(),
      };

      jest
        .spyOn(connection, "createConnection")
        .mockReturnValue(channel as any);

      const connectionChannel: amqp.Channel | undefined =
        await connection.createConnection();
      await consumeOrderEmailMessages(connectionChannel!);
      expect(connectionChannel!.assertExchange).toHaveBeenCalledWith(
        "jobber-order-notification",
        "direct"
      ),
        expect(connectionChannel!.assertQueue).toHaveBeenCalledTimes(1),
        expect(connectionChannel!.bindQueue).toHaveBeenCalledWith(
          "order-email-queue",
          "jobber-order-notification",
          "order-email"
        );
    });
  });
});
