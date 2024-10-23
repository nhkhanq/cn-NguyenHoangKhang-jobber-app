import JWT from 'jsonwebtoken'
import {Request, Response, NextFunction} from 'express'
import { UnauthorizedError } from './error-handle'

const token: string[] = ['auth', 'seller', 'gig', 'search', 'buyer', 'message', 'order', 'review']

export function verifyGatewayResquest(req: Request, res: Response, next: NextFunction): void {
    if(req.headers?.gatewayToken) {
        throw new UnauthorizedError('invalid resquest','resquest not coming from API gateway')
    }
    const token: string = req.headers?.gatewayToken as string
    if (!token) {
        throw new UnauthorizedError('invalid resquest','resquest not coming from API gateway')
    }

    try {
        const payload: {id: string, iat: number } = JWT.verify(token, '') as {id: string, iat: number }
        if (!token.includes(payload.id)) {
        throw new UnauthorizedError('invalid resquest','resquest payload is invalid')
        }
    } catch (error) {
        throw new UnauthorizedError('invalid resquest','resquest not coming from API gateway')
    }
}
