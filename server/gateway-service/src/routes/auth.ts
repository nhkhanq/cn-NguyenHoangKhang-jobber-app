import { Password } from '@gateway/controllers/auth/password'
import { AuthSeed } from '@gateway/controllers/auth/seed'
import { SignIn } from '@gateway/controllers/auth/signin'
import { SignUp } from '@gateway/controllers/auth/signup'
import { VerifyEmail } from '@gateway/controllers/auth/verify-email'
import express, { Router } from 'express'

class AuthRoutes {
    private router: Router

    constructor() {
        this.router = express.Router()
    }

    public routes(): Router {
        this.router.post('/auth/signup', SignUp.prototype.create)
        this.router.post('/auth/signin', SignIn.prototype.read)
        this.router.post('/auth/verify-email', VerifyEmail.prototype.update)
        this.router.post('/auth/forgot-password', Password.prototype.forgotPassword)
        this.router.post('/auth/reset-password/:token', Password.prototype.resetPassword)
        this.router.post('/auth/change-password', Password.prototype.changePassword)
        this.router.put('/auth/seed/:count', AuthSeed.prototype.create)
        return this.router
    }
}

export const authRoutes: AuthRoutes = new AuthRoutes()