import { config } from "@notification/config"
import { IEmailLocals, winstonLogger } from "jobber-shared-for-hkhanq"
import { Logger } from "winston"
import nodemailer, { Transporter } from 'nodemailer'
import Email from "email-templates"
import path from 'path'


const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransport', 'debug')

async function emailTemplates(template: string, reciver: string, locals: IEmailLocals): Promise<void> {
    try {
        const smtpTransporter: Transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: config.SENDER_EMAIL,
                pass: config.SENDER_EMAIL_PASSWORD
            }
        })

        const email: Email = new Email({
            message: {
                from: `Jobber App <${config.SENDER_EMAIL}>`
            },
            send: true, 
            preview: false,
            transport: smtpTransporter,
            views: {
                options: {
                    extension: 'ejs'
                }
            }, 
            juice: true,
            juiceResources: {
                preserveImportant: true,
                webResources: {
                    rebaseRelativeTo: path.join(__dirname, '../build')
                }
            }
        })

        await email.send({
            template: path.join(__dirname,  '..', 'src/emails', template),
            message: {to: reciver},
            locals
        })
    } catch (error) {
        log.error(error)
    }
}

export { emailTemplates }
