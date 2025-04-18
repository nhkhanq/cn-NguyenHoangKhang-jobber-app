import { Request, Response } from "express";
import * as auth from "@auth/services/auth.service";
import {
  authMock,
  authMockRequest,
  authMockResponse,
  authUserPayload,
} from "./mocks/auth.mock";
import { read } from "../signin";

jest.mock("@auth/services/auth.service");
jest.mock("jobber-shared-for-hkhanq");
jest.mock("@auth/queues/auth.producer");
jest.mock("@elastic/elasticsearch");

const USERNAME = "Khanq";
const PASSWORD = "password";

describe("CurrentUser", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("read method", () => {
    it("should return authenticated user", async () => {
      const req = authMockRequest(
        {},
        { username: USERNAME, password: PASSWORD },
        authUserPayload
      ) as unknown as Request;

      const res = authMockResponse();

      jest.spyOn(auth, "getAuthUserById").mockResolvedValue(authMock);

      await read(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authenticated user",
        user: authMock,
      });
    });
  });
});
