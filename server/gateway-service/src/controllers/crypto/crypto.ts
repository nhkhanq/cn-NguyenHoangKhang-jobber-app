import { AxiosResponse } from 'axios'
import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import { cryptoService } from '@gateway/services/api/crypto.service'

export class CryptoController {
  public async getSupportedTokens(req: Request, res: Response): Promise<void> {
    try {
      const response: AxiosResponse = await cryptoService.getSupportedTokens()
      res.status(StatusCodes.OK).json({
        message: response.data.message,
        success: response.data.success,
        data: response.data.data
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error getting supported tokens',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  public async getETHPrice(req: Request, res: Response): Promise<void> {
    try {
      const { usdAmount } = req.query
      const response: AxiosResponse = await cryptoService.getETHPrice(parseFloat(usdAmount as string))
      res.status(StatusCodes.OK).json({
        message: response.data.message,
        success: response.data.success,
        data: response.data.data
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error getting ETH price',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  public async getSellerWallet(req: Request, res: Response): Promise<void> {
    try {
      const { sellerId } = req.params
      const response: AxiosResponse = await cryptoService.getSellerWallet(sellerId)
      res.status(StatusCodes.OK).json({
        message: response.data.message,
        success: response.data.success,
        data: response.data.data
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error getting seller wallet address',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  public async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const response: AxiosResponse = await cryptoService.createOrder(req.body)
      res.status(StatusCodes.CREATED).json({
        message: response.data.message,
        success: response.data.success,
        data: response.data.data
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error creating crypto order',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  public async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params
      const response: AxiosResponse = await cryptoService.getOrder(orderId)
      res.status(StatusCodes.OK).json({
        message: response.data.message,
        success: response.data.success,
        data: response.data.data
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error getting crypto order',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  public async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params
      const response: AxiosResponse = await cryptoService.processPayment(orderId, req.body)
      res.status(StatusCodes.OK).json({
        message: response.data.message,
        success: response.data.success,
        data: response.data.data
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error processing crypto payment',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  public async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params
      const response: AxiosResponse = await cryptoService.updateOrderStatus(orderId, req.body)
      res.status(StatusCodes.OK).json({
        message: response.data.message,
        success: response.data.success,
        data: response.data.data
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error updating crypto order status',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  public async completeOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params
      const response: AxiosResponse = await cryptoService.completeOrder(orderId)
      res.status(StatusCodes.OK).json({
        message: response.data.message,
        success: response.data.success,
        data: response.data.data
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error completing crypto order',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  public async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const { address, chainId } = req.params
      const response: AxiosResponse = await cryptoService.getBalance(address, parseInt(chainId))
      res.status(StatusCodes.OK).json({
        message: response.data.message,
        success: response.data.success,
        data: response.data.data
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error getting wallet balance',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  public async getTransactionDetails(req: Request, res: Response): Promise<void> {
    try {
      const { txHash, chainId } = req.params
      const response: AxiosResponse = await cryptoService.getTransactionDetails(txHash, parseInt(chainId))
      res.status(StatusCodes.OK).json({
        message: response.data.message,
        success: response.data.success,
        data: response.data.data
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error getting transaction details',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  public async getOrdersByBuyer(req: Request, res: Response): Promise<void> {
    try {
      const { buyerAddress } = req.params
      const response: AxiosResponse = await cryptoService.getOrdersByBuyer(buyerAddress, req.query)
      res.status(StatusCodes.OK).json({
        message: response.data.message,
        success: response.data.success,
        data: response.data.data
      })
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error getting buyer orders',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
} 