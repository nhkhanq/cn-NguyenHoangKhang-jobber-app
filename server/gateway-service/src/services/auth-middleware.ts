import { IAuthPayload, NotAuthorizedError } from "@tanlan/jobber-shared"
import {Request, Response, NextFunction } from "express"
import { verify } from "jsonwebtoken";
import { config } from "@gateway/config";


class AuthMiddleware {
    public verifyUser(req: Request, res: Response, next: NextFunction): void {
        if(!req.session?.jwt) {
            throw new NotAuthorizedError('Token is not available', 'Gateway service verifyUser method()')
        }
        try {
            const payload: IAuthPayload = verify(req.session?.jwt, `${config.JWT_TOKEN}`) as IAuthPayload
            req.currentUser = payload
        } catch (error) {
            throw new NotAuthorizedError('Token is not available', 'Gateway service verifyUser method()')
        }
        next()
    }

    public checkAuthentication (req: Request, res: Response, next: NextFunction) {
        if(!req.currentUser) {
            throw new NotAuthorizedError('Auth is req to access', 'Gateway service checkAuthentication method()')
        }
        next()
    }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware()