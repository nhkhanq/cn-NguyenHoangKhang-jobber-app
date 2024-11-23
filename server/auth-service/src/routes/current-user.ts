import { create } from '@auth/controller/signup'
import { read } from '@auth/controller/signin'
import { update } from '@auth/controller/verify-email'
import { changePassword, fogotPassword, resetPassword } from '@auth/controller/password'
import express, { Router } from 'express'
import { resendEmail } from '@auth/controller/current-user'

const route: Router = express.Router()

export function currentUserRoutes(): Router {
    route.post('/currentuser', read)
    route.post('/resend-email', resendEmail)

    return route
} 