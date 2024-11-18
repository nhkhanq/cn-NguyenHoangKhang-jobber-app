import { signupSchema } from '@auth/schema/signup'
import { createAuthUser, getUserByUsernameOrEmail, signToken } from '@auth/services/auth.service'
import { BadRequestError, firstLetterUppercase, IAuthDocument, IEmailMessageDetails, uploads } from '@tanlan/jobber-shared'
import { UploadApiResponse } from 'cloudinary'
import { Request, Response } from 'express'
import { lowerCase } from 'lodash'
import { v4 as uuidV4 } from 'uuid'
import { publishDirecMessage } from '@auth/queues/auth.producer'
import { authChannel } from '@auth/server'
import * as crypto from 'crypto';
import { config } from '@auth/config'
import { StatusCodes } from 'http-status-codes'


export async function create(req: Request, res: Response): Promise<void> {
    const { error } = await Promise.resolve(signupSchema.validate(req.body))
    if (error?.details) {
        throw new BadRequestError(error.details[0].message,  'Signup create() method error')
    }

    const { username, email, password, country, profilePicture } = req.body
    const checkIfUserExist: IAuthDocument | undefined = await getUserByUsernameOrEmail(username, email)
    if (checkIfUserExist) {
        throw new BadRequestError('Invalid credentials', 'Signup create() method error')
    }
    const profilePublicId = uuidV4()
    const uploadResult: UploadApiResponse = await uploads(profilePicture, `${profilePublicId}`, true, true) as UploadApiResponse
    if (!uploadResult.public_id) {
        throw new BadRequestError('File upload error', 'Signup create() method error')
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20))
    const randomCharacters: string = await randomBytes.toString('hex')
    const authData: IAuthDocument = {
        username: firstLetterUppercase(username),
        email: lowerCase(email),
        profilePublicId,
        password,
        country,
        profilePicture: uploadResult?.secure_url, 
        emailVerificationToken: randomCharacters
    } as IAuthDocument
    const result: IAuthDocument | undefined = await createAuthUser(authData)
    const verifucationLink = `${config.CLIENT_URL}/comfirm_email?v_token=${authData.emailVerificationToken}`
    const messageDetails: IEmailMessageDetails = {
        receiverEmail: result?.email,
        verifyLink: verifucationLink,
        template: 'verifyEmail'
    }
    await publishDirecMessage(
        authChannel,
        'jobber-order-notification', //exchangeName , noti service, email consumer file
        'auth-email', //routing key, noti service, email consumer file
        JSON.stringify(messageDetails),
        'verify email message has been to sent noti service'
      )
      const userJWT: string = signToken(result!.id!, result!.email!, result!.username!)
      res.status(StatusCodes.CREATED).json({message: 'User create success', user: result, token: userJWT})
}