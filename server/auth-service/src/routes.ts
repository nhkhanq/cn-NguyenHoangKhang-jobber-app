import { Application } from "express";
import { authRoutes } from "@auth/routes/auth";
import { verifyGatewayRequest } from "jobber-shared-for-hkhanq";
import { currentUserRoutes } from "@auth/routes/current-user";

const BASE_PATH = '/api/v1/auth';

export function appRoutes(app: Application): void {
    app.use(BASE_PATH,verifyGatewayRequest, authRoutes())
    app.use(BASE_PATH,verifyGatewayRequest, currentUserRoutes())
     // app.use(BASE_PATH, (req: Request) => {
     //   console.log(req.headers);
     // });
}