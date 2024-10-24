import express from 'express';
import{ Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

let router = express.Router();

export function healthRoutes(): Router {
  router.get('/notification-health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('Notification service is healthy');
  });
  return router;
}

export default router;