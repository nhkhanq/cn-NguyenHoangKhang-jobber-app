import { pool } from '@review/database'
import { publishFanoutMessage } from '@review/queues/review.producer'
import { reviewChannel } from '@review/server'
import { IReviewDocument, IReviewMessageDetails } from 'jobber-shared-for-hkhanq'

const addReview = async (data: IReviewDocument): Promise<IReviewDocument> => {
  const {
    gigId,
    reviewerId,
    reviewerImage,
    sellerId,
    review,
    rating,
    orderId,
    reviewType,
    reviewerUsername,
    country
  } = data
  const createdAtDate = new Date()
  const { rows } = await pool.query(
    `INSERT INTO reviews(gigId, reviewerId, reviewerImage, sellerId, review, rating, orderId, reviewType, reviewerUsername, country, createdAt)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
    [gigId, reviewerId, reviewerImage, sellerId, review, rating, orderId, reviewType, reviewerUsername, country, createdAtDate]
  )
  const messageDetails: IReviewMessageDetails = {
    gigId: data.gigId,
    reviewerId: data.reviewerId,
    sellerId: data.sellerId,
    review: data.review,
    rating: data.rating,
    orderId: data.orderId,
    createdAt: `${createdAtDate}`,
    type: `${reviewType}`
  }
  await publishFanoutMessage(
    reviewChannel,
    'jobber-review',
    JSON.stringify(messageDetails),
    'Review details sent to order and users services'
  )
  return rows[0]
}



export { addReview }