import { SignUp } from '@gateway/controllers/auth/signup'
import { SignIn } from '@gateway/controllers/auth/signin'
import { VerifyEmail } from '@gateway/controllers/auth/verify-email'
import { Health } from '@gateway/controllers/health'
import express, { Router } from 'express'
import { Password } from '@gateway/controllers/auth/password'

class AuthRoutes {
    private router: Router

    constructor() {
        this.router = express.Router()
    }

    public routes(): Router {
        this.router.post('/auth/signup', SignUp.prototype.create);
        this.router.post('/auth/signin', SignIn.prototype.read);
        this.router.post('/auth/verify-email', VerifyEmail.prototype.update);
        this.router.post('/auth/forgot-password', Password.prototype.forgotPassword);
        this.router.post('/auth/reset-password/:token', Password.prototype.resetPassword);
        this.router.post('/auth/change-password', Password.prototype.changePassword);
        return this.router
    }
}

export const authRoutes: AuthRoutes = new AuthRoutes()