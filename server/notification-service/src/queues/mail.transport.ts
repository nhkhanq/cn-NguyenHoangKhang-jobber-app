import { config } from "@notification/config"
import { emailTemplates } from "@notification/helpers"
import { IEmailLocals, winstonLogger } from "@tanlan/jobber-shared"
import { Logger } from "winston"

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransport', 'debug')

async function sendEmail(template:string, reciver: string, locals: IEmailLocals): Promise<void> {
    try {
        //logic send email
        emailTemplates(template, reciver, locals)
        log.info('Email send success')
    } catch (error) {
        log.log('error', 'NotificationService sendEmail() method:', error);
    }
}

export { sendEmail }
