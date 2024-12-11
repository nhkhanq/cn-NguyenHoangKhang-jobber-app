import { ConversationModel } from '@chat/models/conversation.schema'
import { MessageModel } from '@chat/models/message.schema'
import { publishDirectMessage } from '@chat/queues/message.producer'
import { chatChannel, socketIOChatObject } from '@chat/server'
import { IMessageDetails, IMessageDocument, lowerCase } from 'jobber-shared-for-hkhanq'

const createConversation = async (conversationId: string, sender: string, receiver: string): Promise<void> => {
  await ConversationModel.create({
    conversationId,
    senderUsername: sender,
    receiverUsername: receiver
  })
}

const addMessage = async (data: IMessageDocument): Promise<IMessageDocument> => {
  const message: IMessageDocument = await MessageModel.create(data) as IMessageDocument
  if (data.hasOffer) {
    const emailMessageDetails: IMessageDetails = {
      sender: data.senderUsername,
      amount: `${data.offer?.price}`,
      buyerUsername: lowerCase(`${data.receiverUsername}`),
      sellerUsername: lowerCase(`${data.senderUsername}`),
      title: data.offer?.gigTitle,
      description: data.offer?.description,
      deliveryDays: `${data.offer?.deliveryInDays}`,
      template: 'offer'
    }
    // send email
    await publishDirectMessage(
      chatChannel,
      'jobber-order-notification',
      'order-email',
      JSON.stringify(emailMessageDetails),
      'Order email sent to notification service.'
    )
  }
  socketIOChatObject.emit('message received', message)
  return message
}

export { createConversation, addMessage }