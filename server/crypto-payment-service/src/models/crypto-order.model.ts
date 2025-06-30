import mongoose, { Schema, Document } from 'mongoose';

export interface ICryptoOrder extends Document {
  orderId: string;
  jobberOrderId: string;
  buyer: string;
  seller: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: string;
  platformFee: string;
  chainId: number;
  status: 'created' | 'paid' | 'delivered' | 'completed' | 'disputed' | 'cancelled' | 'refunded';
  autoRelease: boolean;
  transactionHash?: string;
  blockNumber?: number;
  confirmations: number;
  releaseTime?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CryptoOrderSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    jobberOrderId: { type: String, required: true },
    buyer: { type: String, required: true },
    seller: { type: String, required: true },
    tokenAddress: { type: String, required: true },
    tokenSymbol: { type: String, required: true },
    amount: { type: String, required: true },
    platformFee: { type: String, required: true },
    chainId: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ['created', 'paid', 'delivered', 'completed', 'disputed', 'cancelled', 'refunded'],
      default: 'created'
    },
    autoRelease: { type: Boolean, default: false },
    transactionHash: { type: String },
    blockNumber: { type: Number },
    confirmations: { type: Number, default: 0 },
    releaseTime: { type: Date },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

export const CryptoOrderModel = mongoose.model<ICryptoOrder>('CryptoOrder', CryptoOrderSchema); 