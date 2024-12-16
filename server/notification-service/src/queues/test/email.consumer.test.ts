import * as connection from '@notification/queues/connection'
import { consumeAuthEmailMessages } from '@notification/queues/email.consumer'
import amqp from 'amqplib'

jest.mock('@notification/queues/connection')
jest.mock('amqp')
jest.mock('jobber-shared-for-hkhanq')

describe('Email Consumer', ()=> {
    beforeEach(() => {
        jest.resetAllMocks()
    })
})    

afterEach(() => {
    jest.resetAllMocks()
})

describe('consumerAuthEmailMessage method',  ()=> {
    it('should be called', async () => {
        const channel = {
            assertExchange: jest.fn(),
            publish: jest.fn(),
            assertQueue: jest.fn(),
            bindQueue: jest.fn(),
            consume: jest.fn(),
        }

        jest.spyOn(channel, 'assertExchange')
        jest.spyOn(channel, 'assertQueue').mockReturnValue({ queue: 'auth-email-queue', messageCount: 0, consumerCount: 0 })

        jest.spyOn(connection, 'createConnection').mockResolvedValue(channel as never);


        const connectionChannel: amqp.Channel | undefined = await connection.createConnection()
        await consumeAuthEmailMessages(connectionChannel!)

        expect(connectionChannel!.assertExchange).toHaveBeenCalledWith('jobber-order-notification', 'direct')
        expect(connectionChannel!.assertQueue).toHaveReturnedTimes(1)
        expect(connectionChannel!.consume).toHaveReturnedTimes(1)
        expect(connectionChannel!.assertExchange).toHaveBeenCalledWith('order-email-queue' ,'jobber-order-notification', 'auth-email')

    })
})
