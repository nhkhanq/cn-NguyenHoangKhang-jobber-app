import { gigCreate } from '@gig/controller/create'
import { gigDelete } from '@gig/controller/delete'
import { gigById, sellerGigs, sellerInactiveGigs } from '@gig/controller/get'
import { gigUpdate, gigUpdateActive } from '@gig/controller/update'
import express, { Router } from 'express'

const router: Router = express.Router()


const gigRoutes = (): Router => {
  router.get('/:gigId', gigById)
  router.get('/seller/:sellerId', sellerGigs)
  router.get('/seller/pause/:sellerId', sellerInactiveGigs)
  router.post('/create', gigCreate)
  router.put('/:gigId', gigUpdate)
  router.put('/active/:gigId', gigUpdateActive)
  router.delete('/:gigId/:sellerId', gigDelete)
  return router
}

export { gigRoutes }