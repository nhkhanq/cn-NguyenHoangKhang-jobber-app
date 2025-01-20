import { ObjectId } from "mongoose"
import { IRatingCategories, IReviewDocument } from "./review.interface"
import { ISellerDocument } from "./seller.interface"

export type GigType =
  | string
  | string[]
  | number
  | unknown
  | undefined

export interface ICreateGig extends Record<string, GigType> {
  sellerId?: string
  profilePicture?: string
  title: string
  categories: string
  description: string
  subCategories: string[]
  tags: string[]
  price: number
  coverImage: string
  expectedDelivery: string
  basicTitle: string
  basicDescription: string
}

export interface ISellerGig {
  _id?: string | ObjectId
  id?: string | ObjectId
  sellerId?: string | ObjectId
  title: string
  username?: string
  profilePicture?: string
  email?: string
  description: string
  active?: boolean
  categories: string
  subCategories: string[]
  tags: string[]
  ratingsCount?: number 
  ratingSum?: number 
  ratingCategories?: IRatingCategories
  expectedDelivery: string
  basicTitle: string
  basicDescription: string
  price: number
  coverImage: string
  createdAt?: Date | string
  sortId?: number
  toJSON?: () => unknown
}

export interface IGigContext {
  gig: ISellerGig
  seller: ISellerDocument
  isSuccess?: boolean
  isLoading?: boolean
}

export interface IGigsProps {
  type?: string
  gig?: ISellerGig
}

export interface IGigCardItems {
  gig: ISellerGig
  linkTarget: boolean
  showEditIcon: boolean
}

export interface ISelectedBudget {
  minPrice: string
  maxPrice: string
}

export interface IGigViewReviewsProps {
  showRatings: boolean
  reviews?: IReviewDocument[]
}

export interface IGigInfo {
  total: number | string
  title: string
  bgColor: string
}

export interface IGigTopProps {
  gigs: ISellerGig[]
  title?: string
  subTitle?: string
  category?: string
  width: string
  type: string
}
