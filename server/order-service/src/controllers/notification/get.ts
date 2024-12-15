import { getNotificationsById } from '@order/service/notification.service'
import { IOrderNotifcation } from 'jobber-shared-for-hkhanq'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

const notifications = async (req: Request, res: Response): Promise<void> => {
  const notifications: IOrderNotifcation[] = await getNotificationsById(req.params.userTo)
  res.status(StatusCodes.OK).json({ message: 'Notifications', notifications })
}

export { notifications }