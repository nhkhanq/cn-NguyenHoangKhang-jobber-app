import { addReview } from '@review/service/review.service'
import { IReviewDocument } from 'jobber-shared-for-hkhanq'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export const review = async (req: Request, res: Response): Promise<void> => {
  const review: IReviewDocument = await addReview(req.body)
  res.status(StatusCodes.CREATED).json({ message: 'Review created successfully.', review })
}