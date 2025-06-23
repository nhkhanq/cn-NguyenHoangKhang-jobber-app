import {
  BadRequestError,
  IAuthDocument,
  IEmailMessageDetails,
} from "jobber-shared-for-hkhanq";
import * as crypto from "crypto";
import { config } from "@auth/config";
import { Request, Response } from "express";
import { changePasswordSchema, emailSchema } from "@auth/schema/password";
import {
  getAuthUserByPasswordToken,
  getUserByEmail,
  getUserByUsername,
  updatePassword,
  updatePasswordToken,
} from "@auth/services/auth.service";
import { publishDirecMessage } from "@auth/queues/auth.producer";
import { authChannel } from "@auth/server";
import { StatusCodes } from "http-status-codes";
import { AuthModel } from "@auth/models/auth.schema";

export async function forgotPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { error } = emailSchema.validate(req.body);
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      "Password create() method error"
    );
  }
  const { email } = req.body;
  const existingUser: IAuthDocument | undefined = await getUserByEmail(email);
  if (!existingUser) {
    throw new BadRequestError(
      "Invalid",
      "Password createFogotPassword() method error"
    );
  }
  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = await randomBytes.toString("hex");
  const date: Date = new Date();
  date.setHours(date.getHours() + 1);
  await updatePasswordToken(existingUser.id!, randomCharacters, date);
  const resetLink = `${config.CLIENT_URL}/reset_password?token=${randomCharacters}`;
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: existingUser.email,
    resetLink,
    username: existingUser.username,
    template: "forgotPassword",
  };
  await publishDirecMessage(
    authChannel,
    "jobber-email-notification",
    "auth-email",
    JSON.stringify(messageDetails)
    // 'Forgot password message send to notification service'
  );
  res.status(StatusCodes.OK).json({ message: "Password reset email sent" });
}

export async function resetPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { error } = emailSchema.validate(req.body);
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      "Password resetPassword() method error"
    );
  }
  const { password, confimPassword } = req.body;
  const { token } = req.params;
  if (password !== confimPassword) {
    throw new BadRequestError(
      "Password no match",
      "Password resetPassword method() error"
    );
  }

  const existingUser: IAuthDocument | undefined =
    await getAuthUserByPasswordToken(token);
  if (!existingUser) {
    throw new BadRequestError(
      "Reset token has expired",
      "Password resetPassword method() error"
    );
  }
  const hashedPassword: string = await AuthModel.prototype.hashPassword(
    password
  );
  await updatePassword(existingUser.id!, hashedPassword);
  const messageDetails: IEmailMessageDetails = {
    username: existingUser.username,
    template: "resetPasswordSuccess",
  };
  await publishDirecMessage(
    authChannel,
    "jobber-email-notification",
    "auth-email",
    JSON.stringify(messageDetails)
    // "Reset password message send to notification service"
  );
  res.status(StatusCodes.OK).json({ message: "Password reset success" });
}

export async function changePassword(
  req: Request,
  res: Response
): Promise<void> {
  const { error } = changePasswordSchema.validate(req.body);
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      "Password changePassword() method error"
    );
  }
  const { currenPassword, newPassword } = req.body;
  if (currenPassword !== newPassword) {
    throw new BadRequestError(
      "Password no match",
      "Password changePassword method() error"
    );
  }

  const existingUser: IAuthDocument | undefined = await getUserByUsername(
    `${req.currentUser?.username}`
  );
  if (!existingUser) {
    throw new BadRequestError(
      "Invalid password",
      "Password changePassword method() error"
    );
  }
  const hashedPassword: string = await AuthModel.prototype.hashPassword(
    newPassword
  );
  await updatePassword(existingUser.id!, hashedPassword);
  const messageDetails: IEmailMessageDetails = {
    username: existingUser.username,
    template: "resetPasswordSuccess",
  };
  await publishDirecMessage(
    authChannel,
    "jobber-email-notification",
    "auth-email",
    JSON.stringify(messageDetails)
  );
  res.status(StatusCodes.OK).json({ message: "Password reset success" });
}
