import { gigCreate } from '@gig/controller/create'
import { gigDelete } from '@gig/controller/delete'
import { gigUpdate, gigUpdateActive } from '@gig/controller/update'
import express, { Router } from 'express'

const router: Router = express.Router()


const gigRoutes = (): Router => {
  router.post('/create', gigCreate)
  router.put('/:gigId', gigUpdate)
  router.put('/active/:gigId', gigUpdateActive)
  router.delete('/:gigId/:sellerId', gigDelete)
  return router
}

export { gigRoutes }