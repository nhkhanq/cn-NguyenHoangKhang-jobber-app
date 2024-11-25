import { Request, Response } from 'express';
import { AxiosResponse } from 'axios';
import { authService } from '@gateway/services/api/auth.service';
import { StatusCodes } from 'http-status-codes';

export class CurrentUser {
  public async read(req: Request, res: Response) {
    const response: AxiosResponse = await authService.getCurrentUser() 
    res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user });
  }

  public async resendEmail(req: Request, res: Response) {
    const response: AxiosResponse = await authService.resendEmail(req.body) 
    res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user });
  }
}