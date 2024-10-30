import { IEmailLocals } from "@tanlan/jobber-shared";
declare function emailTemplates(template: string, reciver: string, locals: IEmailLocals): Promise<void>;
export { emailTemplates };
