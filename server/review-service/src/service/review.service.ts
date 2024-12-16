import { pool } from '@review/database'
import { IReviewDocument } from 'jobber-shared-for-hkhanq'

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
  return rows[0]
}


export { addReview }