import mongoose, { Schema, Document } from 'mongoose';

export interface ICryptoOrder extends Document {
  orderId: string;
  jobberOrderId?: string;
  buyerAddress: string;
  sellerAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: string;
  usdAmount: number;
  platformFee: string;
  platformFeeUSD: number;
  chainId: number;
  status: 'created' | 'paid' | 'delivered' | 'completed' | 'disputed' | 'cancelled' | 'refunded';
  autoRelease: boolean;
  transactionHash?: string;
  blockNumber?: number;
  confirmations: number;
  releaseTime?: Date;
  completedAt?: Date;
  deliveredAt?: Date;
  gigTitle?: string;
  description?: string;
  contractCreationTx?: string;
  priceData?: {
    ethPriceUSD: number;
    exchangeRate: string;
    conversionTime: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CryptoOrderSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    jobberOrderId: { type: String },
    buyerAddress: { type: String, required: true },
    sellerAddress: { type: String, required: true },
    tokenAddress: { type: String, required: true },
    tokenSymbol: { type: String, required: true },
    amount: { type: String, required: true },
    usdAmount: { type: Number, required: true },
    platformFee: { type: String, required: true },
    platformFeeUSD: { type: Number, required: true },
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
    completedAt: { type: Date },
    deliveredAt: { type: Date },
    gigTitle: { type: String },
    description: { type: String },
    contractCreationTx: { type: String },
    priceData: {
      ethPriceUSD: { type: Number },
      exchangeRate: { type: String },
      conversionTime: { type: Date }
    }
  },
  { timestamps: true }
);

export const CryptoOrderModel = mongoose.model<ICryptoOrder>('CryptoOrder', CryptoOrderSchema); 