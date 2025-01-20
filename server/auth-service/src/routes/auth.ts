import { changePassword, forgotPassword, resetPassword } from '@auth/controller/password'
import { read } from '@auth/controller/signin'
import { create } from '@auth/controller/signup'
import { update } from '@auth/controller/verify-email'
import { updateOTP } from '@auth/controller/verify-otp'
import express, { Router } from 'express'

const router: Router = express.Router()

export function authRoutes(): Router {
  router.post('/signup', create)
  router.post('/signin', read)
  router.put('/verify-email', update)
  router.put('/verify-otp/:otp', updateOTP)
  router.put('/forgot-password', forgotPassword)
  router.put('/reset-password/:token', resetPassword)
  router.put('/change-password', changePassword)

  return router
}