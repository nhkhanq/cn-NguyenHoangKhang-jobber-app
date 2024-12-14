import { message } from '@chat/controller/create'
import { conversation, conversationList, messages, userMessages } from '@chat/controller/get'
import { markMultipleMessages, markSingleMessage, offer } from '@chat/controller/update'
import express, { Router } from 'express'

const router: Router = express.Router()

const messageRoutes = (): Router => {
  router.get('/conversation/:senderUsername/:receiverUsername', conversation)
  router.get('/conversations/:username', conversationList)
  router.get('/:senderUsername/:receiverUsername', messages)
  router.get('/:conversationId', userMessages)
  router.post('/', message)
  router.put('/offer', offer)
  router.put('/mark-as-read', markSingleMessage)
  router.put('/mark-multiple-as-read', markMultipleMessages)

  return router
}

export { messageRoutes }