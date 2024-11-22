import { Request, Response } from 'express';
import { AxiosResponse } from 'axios';
import { authService } from '@gateway/services/api/auth.service';
import { StatusCodes } from 'http-status-codes';

export class SignUp {
  public async create(req: Request, res: Response) {
    const response: AxiosResponse = await authService.signUp(req.body);
    req.session = { jwt: response.data.token }; 
    res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user });
  }
}