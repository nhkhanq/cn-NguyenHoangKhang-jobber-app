import { read, resendEmail } from '@auth/controller/current-user'
import { token } from '@auth/controller/refresh-token'
import express, { Router } from 'express'

const router: Router = express.Router()

export function currentUserRoutes(): Router {
  router.get('/refresh-token/:username', token)
  router.get('/currentuser', read)
  router.post('/resend-email', resendEmail)

  return router
}