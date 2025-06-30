import { AxiosResponse } from 'axios'
import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import { cryptoService } from '@gateway/services/api/crypto.service'

export class Create {
  public async cryptoOrder(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await cryptoService.createCryptoOrder(req.body)
    res.status(StatusCodes.CREATED).json({ 
      message: response.data.message, 
      cryptoOrder: response.data.data || response.data.cryptoOrder 
    })
  }
} 