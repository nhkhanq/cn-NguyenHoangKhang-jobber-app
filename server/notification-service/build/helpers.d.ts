import { IEmailLocals } from "jobber-shared-for-hkhanq";
declare function emailTemplates(template: string, reciver: string, locals: IEmailLocals): Promise<void>;
export { emailTemplates };
