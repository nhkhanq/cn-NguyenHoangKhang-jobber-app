import { create } from '@auth/controller/signup'
import express, { Router } from 'express'

const route: Router = express.Router()

export function authRoutes(): Router {
    route.post('/signup', create)

    return route
}