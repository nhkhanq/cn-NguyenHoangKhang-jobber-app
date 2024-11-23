import { create } from '@auth/controller/signup'
import { read } from '@auth/controller/signin'
import { update } from '@auth/controller/verify-email'
import { changePassword, fogotPassword, resetPassword } from '@auth/controller/password'
import express, { Router } from 'express'

const route: Router = express.Router()

export function authRoutes(): Router {
    route.post('/signup', create)
    route.post('/signin', read)
    route.post('/verify-email', update)
    route.put('/forgot-password', fogotPassword)
    route.put('/reset-password/:token', resetPassword)
    route.put('/change-password', changePassword)

    return route
}