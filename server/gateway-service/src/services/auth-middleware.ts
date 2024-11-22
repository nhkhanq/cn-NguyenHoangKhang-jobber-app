import { IAuthPayload, NotAuthorizedError } from "jobber-shared-for-hkhanq"
import {Request, Response, NextFunction } from "express"
import { verify } from "jsonwebtoken"
import { config } from "@gateway/config"


class AuthMiddleware {
    public verifyUser(req: Request, _res: Response, next: NextFunction): void {
      if (!req.session?.jwt) {
        throw new NotAuthorizedError('Token is not available. Please login again.', 'GatewayService verifyUser() method error')
      }
  
      try {
        const payload: IAuthPayload = verify(req.session?.jwt, `${config.JWT_TOKEN}`) as IAuthPayload
        console.log(req.session)
        console.log(payload)
        req.currentUser = payload
      } catch (error) {
        throw new NotAuthorizedError(
          'Token is not available. Please login again.',
          'GatewayService verifyUser() method invalid session error'
        )
      }
      next()
    }
  
    public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
      if (!req.currentUser) {
        throw new NotAuthorizedError('Authentication is required to access this route.', 'GatewayService checkAuthentication() method error')
      }
      next()
    }
  }
  
  export const authMiddleware: AuthMiddleware = new AuthMiddleware()