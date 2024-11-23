import express, { Router } from 'express'
import { CurrentUser } from '@gateway/controllers/current-user'
import { authMiddleware } from '@gateway/services/auth-middleware'

class CurrentUserRoutes {
    private router: Router

    constructor() {
        this.router = express.Router()
    }

    public routes(): Router {
        this.router.get('/auth/currentuser', authMiddleware.checkAuthentication, CurrentUser.prototype.read);
        this.router.post('/auth/resend-email', authMiddleware.checkAuthentication, CurrentUser.prototype.resendEmail);
        return this.router
    }
}

export const currentUserRoutes: CurrentUserRoutes = new CurrentUserRoutes()