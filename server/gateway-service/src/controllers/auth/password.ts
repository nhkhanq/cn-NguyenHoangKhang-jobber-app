import { Request, Response } from 'express'
import { AxiosResponse } from 'axios'
import { authService } from '@gateway/services/api/auth.service'
import { StatusCodes } from 'http-status-codes'

export class Password {
  public async forgotPassword(req: Request, res: Response) {
    const response: AxiosResponse = await authService.forgotPassword(req.body.email)
    res.status(StatusCodes.OK).json({ message: response.data.message })
  }

  public async resetPassword(req: Request, res: Response) {
    const { password, confimPassword } = req.body
    const response: AxiosResponse = await authService.resetPassword(req.params.token, password, confimPassword)
    res.status(StatusCodes.OK).json({ message: response.data.message })
  }

  public async changePassword(req: Request, res: Response) {
    const { currentPassword, newPassword } = req.body
    const response: AxiosResponse = await authService.changePassword(currentPassword, newPassword)
    res.status(StatusCodes.OK).json({ message: response.data.message })
  }
}