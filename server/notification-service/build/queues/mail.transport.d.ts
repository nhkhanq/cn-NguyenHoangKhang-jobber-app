import { IEmailLocals } from 'jobber-shared-for-hkhanq';
declare function sendEmail(template: string, receiverEmail: string, locals: IEmailLocals): Promise<void>;
export { sendEmail };
