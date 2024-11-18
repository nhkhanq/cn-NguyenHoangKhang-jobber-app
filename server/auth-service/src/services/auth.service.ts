import { AuthModel } from "@auth/models/auth.schema";
import { publishDirecMessage } from '@auth/queues/auth.producer'
import { IAuthBuyerMessageDetails, IAuthDocument } from "@tanlan/jobber-shared";
import { omit } from "lodash";
import { authChannel } from '@auth/server';
import { Model } from 'sequelize';

export async function createAuthUser(data: IAuthDocument): Promise<IAuthDocument | undefined> {
      const result: Model = await AuthModel.create(data);
      const messageDetails: IAuthBuyerMessageDetails = {
        username: result.dataValues.username!,
        email: result.dataValues.email!,
        profilePicture: result.dataValues.profilePicture!,
        country: result.dataValues.country!,
        createdAt: result.dataValues.createdAt!,
        type: 'auth'
      }
      await publishDirecMessage(
        channel,
        'jobber-buyer-update',
        'user-buyer',
        JSON.stringify(messageDetails),
        'Buyer details sent to buyer service.'
      );
      const userData: IAuthDocument = omit(result.dataValues, ['password']) as IAuthDocument;
      return userData
    }
