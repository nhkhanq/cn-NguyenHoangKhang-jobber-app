import express, { Router, Request, Response, request } from 'express'
import { StatusCodes } from 'http-status-codes'

const route: Router = express.Router()

export function healthRoutes(): Router {
    route.get('/notification-health', (res: Response, req: Request) => {
        res.status(StatusCodes.OK).send("Notification service is health")
    })
    return route
}