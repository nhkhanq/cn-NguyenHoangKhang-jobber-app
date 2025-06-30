import { AxiosResponse } from 'axios'
import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import { cryptoService } from '@gateway/services/api/crypto.service'

export class Get {
  public async supportedTokens(_req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await cryptoService.getSupportedTokens()
    res.status(StatusCodes.OK).json({ 
      message: response.data.message, 
      tokens: response.data.data || response.data.tokens 
    })
  }

  public async walletBalance(req: Request, res: Response): Promise<void> {
    const { walletAddress, chainId } = req.params
    const response: AxiosResponse = await cryptoService.getWalletBalance(walletAddress, parseInt(chainId))
    res.status(StatusCodes.OK).json({ 
      message: response.data.message, 
      balance: response.data.data || response.data.balance 
    })
  }

  public async cryptoOrder(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params
    const response: AxiosResponse = await cryptoService.getCryptoOrder(orderId)
    res.status(StatusCodes.OK).json({ 
      message: response.data.message, 
      cryptoOrder: response.data.data || response.data.cryptoOrder 
    })
  }

  public async cryptoOrdersByJobberOrderId(req: Request, res: Response): Promise<void> {
    const { jobberOrderId } = req.params
    const response: AxiosResponse = await cryptoService.getCryptoOrdersByJobberOrderId(jobberOrderId)
    res.status(StatusCodes.OK).json({ 
      message: response.data.message, 
      cryptoOrders: response.data.data || response.data.cryptoOrders 
    })
  }

  public async buyerOrders(req: Request, res: Response): Promise<void> {
    const { buyerAddress } = req.params
    const response: AxiosResponse = await cryptoService.getOrdersByBuyer(buyerAddress)
    res.status(StatusCodes.OK).json({ 
      message: response.data.message, 
      orders: response.data.data || response.data.orders 
    })
  }

  public async sellerOrders(req: Request, res: Response): Promise<void> {
    const { sellerAddress } = req.params
    const response: AxiosResponse = await cryptoService.getOrdersBySeller(sellerAddress)
    res.status(StatusCodes.OK).json({ 
      message: response.data.message, 
      orders: response.data.data || response.data.orders 
    })
  }
} 