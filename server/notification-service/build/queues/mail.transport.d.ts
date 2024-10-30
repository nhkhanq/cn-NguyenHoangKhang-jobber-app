import { IEmailLocals } from '@tanlan/jobber-shared';
declare function sendEmail(template: string, receiverEmail: string, locals: IEmailLocals): Promise<void>;
export { sendEmail };
