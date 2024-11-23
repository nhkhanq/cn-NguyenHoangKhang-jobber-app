import { getAuthUserById, getUserByEmail, updateVerifyEmailField } from "@auth/services/auth.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, IAuthDocument, IEmailMessageDetails } from "jobber-shared-for-hkhanq";
import * as crypto from 'crypto';
import { lowerCase } from "lodash";
import { config } from "@auth/config";
import { authChannel } from "@auth/server";
import { publishDirecMessage } from "@auth/queues/auth.producer";

export async function read(req: Request, res: Response): Promise<void> {
    let user = null
    const existingUser: IAuthDocument | undefined = await getAuthUserById(req.currentUser!.id)
    if (Object.keys(existingUser!).length) {
        user = existingUser
    }
    res.status(StatusCodes.OK).json({ message: 'Authenticated user', user})
}

export async function resendEmail(req: Request, res: Response) {
    const { email, userId } = req.body
    const checkIfUserExist: IAuthDocument | undefined = await getUserByEmail(lowerCase(email))
    if(!checkIfUserExist) {
        throw new BadRequestError("Email invalid", 'CurrentUser resendEmail() method error')
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20))
    const randomCharacters: string = await randomBytes.toString('hex')
    const verifcationLink = `${config.CLIENT_URL}/comfirm_email?v_token=${randomCharacters}`
    await updateVerifyEmailField(parseInt(userId), 0, randomCharacters)
    const messageDetails: IEmailMessageDetails = {
        receiverEmail: lowerCase(email),
        verifyLink: verifcationLink,
        template: 'verifyEmail'
    }
    await publishDirecMessage(
        authChannel,
        'jobber-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'Forgot password message send to notification service'
    )
    const updateUser = await getAuthUserById(parseInt(userId))
    res.status(StatusCodes.OK).json({ message: 'Email verifcation sent', user: updateUser})
}