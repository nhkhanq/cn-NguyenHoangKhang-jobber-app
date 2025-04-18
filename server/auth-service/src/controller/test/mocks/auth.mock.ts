import { IAuthDocument, IAuthPayload } from "jobber-shared-for-hkhanq";
import { Response } from "express";

export interface Ijwt {
  jwt?: string;
}

export interface IAuthMock {
  id?: number;
  username?: string;
  email: string;
  password: string;
  createAt?: Date | string;
}

export const authRequest = (
  sessionData: Ijwt,
  body: IAuthMock,
  currentUser?: IAuthPayload | null,
  params?: unknown
) => {
  return { session: sessionData, body, currentUser, params };
};

export const authMockResponse = (): Response => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

export const authUserPayload: IAuthPayload = {
  id: 1,
  username: "hkhanq",
  email: "hkhanq@gmail.com",
  iat: 123465487,
};

export const authMock = {
  id: 1,
  profilePublicId: "21354654987",
  username: "Khang",
  email: "hkhanq@gmail.com",
  country: "VietNam",
  emailVerified: 1,
  createdAt: "2025-01-01T07:42:42.431Z",
  comparePassword: () => {},
  hashPassword: () => false,
} as unknown as IAuthDocument;
