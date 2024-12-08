import { gigCreate } from '@gig/controller/create'
import express, { Router } from 'express'

const router: Router = express.Router()


const gigRoutes = (): Router => {
  router.post('/create', gigCreate)
  return router
}

export { gigRoutes }