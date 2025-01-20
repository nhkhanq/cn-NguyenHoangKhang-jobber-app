import { config } from '@notification/config'
import { emailTemplates } from '@notification/helpers'
import { IEmailLocals, winstonLogger } from 'jobber-shared-for-hkhanq'
import { Logger } from 'winston'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransport', 'debug')

async function sendEmail(template: string, receiverEmail: string, locals: IEmailLocals): Promise<void> {
  try {
    emailTemplates(template, receiverEmail, locals)
    log.info('Email sent successfully.')
  } catch (error) {
    log.log('error', 'NotificationService MailTransport sendEmail() method error:', error)
  }
}

export { sendEmail }