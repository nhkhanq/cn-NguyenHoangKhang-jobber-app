
import { getGigById, getSellerGigs, getSellerPausedGigs } from '@gig/services/gig.service'
import { ISearchResult, ISellerGig } from 'jobber-shared-for-hkhanq'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

const gigById = async (req: Request, res: Response): Promise<void> => {
  const gig: ISellerGig = await getGigById(req.params.gigId)
  res.status(StatusCodes.OK).json({ message: 'Get gig by id', gig })
}

const sellerGigs = async (req: Request, res: Response): Promise<void> => {
  const gigs: ISellerGig[] = await getSellerGigs(req.params.sellerId)
  res.status(StatusCodes.OK).json({ message: 'Seller gigs', gigs })
}

const sellerInactiveGigs = async (req: Request, res: Response): Promise<void> => {
  const gigs: ISellerGig[] = await getSellerPausedGigs(req.params.sellerId)
  res.status(StatusCodes.OK).json({ message: 'Seller gigs', gigs })
}




export { gigById, sellerGigs, sellerInactiveGigs }