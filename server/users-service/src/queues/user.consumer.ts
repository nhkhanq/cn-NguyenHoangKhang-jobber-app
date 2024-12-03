import { config } from '@users/config'
import { createConnection } from '@users/queues/connection'
import { createBuyer, updateBuyerPurchasedGigsProp } from '@users/service/buyer.service'
import { IBuyerDocument, winstonLogger } from 'jobber-shared-for-hkhanq'
import { Channel, ConsumeMessage, Replies } from 'amqplib'
import { Logger } from 'winston'
import { updateSellerCancelledJobsProp, updateSellerCompletedJobsProp, updateSellerOngoingJobsProp, updateTotalGigsCount } from '@users/service/seller.service'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersServiceConsumer', 'debug')

const consumeBuyerDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel
    }
    const exchangeName = 'jobber-buyer-update'
    const routingKey = 'user-buyer'
    const queueName = 'user-buyer-queue'
    await channel.assertExchange(exchangeName, 'direct')
    const jobberQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false })
    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey)
    channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
      const { type } = JSON.parse(msg!.content.toString())
      if (type === 'auth') {
        const { username, email, profilePicture, country, createdAt } = JSON.parse(msg!.content.toString())
        const buyer: IBuyerDocument = {
          username,
          email,
          profilePicture,
          country,
          purchasedGigs: [],
          createdAt
        }
        await createBuyer(buyer)
      } else {
        const { buyerId, purchasedGigs } = JSON.parse(msg!.content.toString())
        await updateBuyerPurchasedGigsProp(buyerId, purchasedGigs, type)
      }
      channel.ack(msg!)
    })
  } catch (error) {
    log.log('error', 'UsersService UserConsumer consumeBuyerDirectMessage() method error:', error)
  }
}

const consumeSellerDirectMessage = async (channel: Channel): Promise<void> => {
    try {
      if (!channel) {
        channel = (await createConnection()) as Channel
      }
      const exchangeName = 'jobber-seller-update'
      const routingKey = 'user-seller'
      const queueName = 'user-seller-queue'
      await channel.assertExchange(exchangeName, 'direct')
      const jobberQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false })
      await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey)
      channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
        const { type, sellerId, ongoingJobs, completedJobs, totalEarnings, recentDelivery, gigSellerId, count } = JSON.parse(
          msg!.content.toString()
        )
        if (type === 'create-order') {
          await updateSellerOngoingJobsProp(sellerId, ongoingJobs)
        } else if (type === 'approve-order') {
          await updateSellerCompletedJobsProp({
            sellerId,
            ongoingJobs,
            completedJobs,
            totalEarnings,
            recentDelivery
          })
        } else if (type === 'update-gig-count') {
          await updateTotalGigsCount(`${gigSellerId}`, count)
        } else if (type === 'cancel-order') {
          await updateSellerCancelledJobsProp(sellerId)
        }
        channel.ack(msg!)
      })
    } catch (error) {
      log.log('error', 'UsersService UserConsumer consumeSellerDirectMessage() method error:', error)
    }
  }


export { consumeBuyerDirectMessage, consumeSellerDirectMessage }