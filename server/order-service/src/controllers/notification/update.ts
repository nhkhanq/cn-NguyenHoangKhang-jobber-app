import { markNotificationAsRead } from '@order/service/notification.service'
import { IOrderNotifcation } from 'jobber-shared-for-hkhanq'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

const markSingleNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  const { notificationId } = req.body
  const notification: IOrderNotifcation = await markNotificationAsRead(notificationId)
  res.status(StatusCodes.OK).json({ message: 'Notification updated successfully.', notification })
}

export { markSingleNotificationAsRead }