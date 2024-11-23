import { create } from '@auth/controller/signup'
import { read } from '@auth/controller/signin'
import { update } from '@auth/controller/verify-email'
import express, { Router } from 'express'

const route: Router = express.Router()

export function authRoutes(): Router {
    route.post('/signup', create)
    route.post('/signin', read)
    route.post('/verify-email', update)

    return route
}