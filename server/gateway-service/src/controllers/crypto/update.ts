import { AxiosResponse } from 'axios'
import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import { cryptoService } from '@gateway/services/api/crypto.service'

export class Update {
  public async confirmPayment(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params
    const response: AxiosResponse = await cryptoService.confirmPayment(orderId, req.body)
    res.status(StatusCodes.OK).json({ 
      message: response.data.message, 
      cryptoOrder: response.data.data || response.data.cryptoOrder 
    })
  }

  public async markDelivered(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params
    const response: AxiosResponse = await cryptoService.markDelivered(orderId, req.body)
    res.status(StatusCodes.OK).json({ 
      message: response.data.message, 
      cryptoOrder: response.data.data || response.data.cryptoOrder 
    })
  }

  public async completeOrder(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params
    const response: AxiosResponse = await cryptoService.completeOrder(orderId)
    res.status(StatusCodes.OK).json({ 
      message: response.data.message, 
      cryptoOrder: response.data.data || response.data.cryptoOrder 
    })
  }

  public async raiseDispute(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params
    const response: AxiosResponse = await cryptoService.raiseDispute(orderId, req.body)
    res.status(StatusCodes.OK).json({ 
      message: response.data.message, 
      cryptoOrder: response.data.data || response.data.cryptoOrder 
    })
  }

  public async resolveDispute(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params
    const response: AxiosResponse = await cryptoService.resolveDispute(orderId, req.body)
    res.status(StatusCodes.OK).json({ 
      message: response.data.message, 
      cryptoOrder: response.data.data || response.data.cryptoOrder 
    })
  }

  public async cancelOrder(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params
    const response: AxiosResponse = await cryptoService.cancelOrder(orderId, req.body)
    res.status(StatusCodes.OK).json({ 
      message: response.data.message, 
      cryptoOrder: response.data.data || response.data.cryptoOrder 
    })
  }
} 