import { gigCreate } from '@gig/controller/create'
import { gigDelete } from '@gig/controller/delete'
import { gigById, gigsByCategory, moreLikeThis, sellerGigs, sellerInactiveGigs, topRatedGigsByCategory } from '@gig/controller/get'
import { gigs } from '@gig/controller/search'
import { gigUpdate, gigUpdateActive } from '@gig/controller/update'
import express, { Router } from 'express'

const router: Router = express.Router()


const gigRoutes = (): Router => {
  router.get('/:gigId', gigById)
  router.get('/seller/:sellerId', sellerGigs)
  router.get('/seller/pause/:sellerId', sellerInactiveGigs)
  router.get('/search/:from/:size/:type', gigs)
  router.get('/category/:username', gigsByCategory);
  router.get('/top/:username', topRatedGigsByCategory);
  router.get('/similar/:gigId', moreLikeThis);
  router.post('/create', gigCreate)
  router.put('/:gigId', gigUpdate)
  router.put('/active/:gigId', gigUpdateActive)
  router.delete('/:gigId/:sellerId', gigDelete)
  return router
}

export { gigRoutes }