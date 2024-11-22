import { AuthModel } from '@auth/models/auth.schema'
import { loginSchema } from '@auth/schema/signin'
import { getUserByEmail, getUserByUsername, signToken } from '@auth/services/auth.service'
import { Request, Response } from 'express'
import { BadRequestError, IAuthDocument, isEmail } from 'jobber-shared-for-hkhanq'
import { omit } from 'lodash'

export async function read(req: Request, res: Response): Promise<void> {
    // Validate request body
    const { error } = loginSchema.validate(req.body);
    if (error?.details) {
        throw new BadRequestError(error.details[0].message, 'SignIn read() method error');
    }

    const { username, password } = req.body;
    const isValidEmail: boolean = isEmail(username);

    // Retrieve user based on username or email
    const existingUser: IAuthDocument | undefined = isValidEmail
        ? await getUserByEmail(username)
        : await getUserByUsername(username);

 
    if (!existingUser) {
        throw new BadRequestError('Invalid credentials', 'SignIn read() method error');
    }

 
    const passwordMatch: boolean = await AuthModel.prototype.comparePassword!(
        password,
        existingUser.password!
    );

    if (!passwordMatch) {
        throw new BadRequestError('Invalid credentials', 'SignIn read() method error');
    }


    const userJWT: string = signToken(
        existingUser.id!,
        existingUser.email!,
        existingUser.username!
    );

    const userData: IAuthDocument = omit(existingUser, ['[password]'])

    // Respond to client
    // res.status(200).json({
    //     message: 'User signed in successfully',
    //     token: userJWT,
    //     user: {
    //         id: existingUser.id,
    //         email: existingUser.email,
    //         username: existingUser.username,
    //     },
    // });
}
