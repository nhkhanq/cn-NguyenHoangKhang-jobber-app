import { Application } from "express";
import { authRoutes } from "@auth/routes/auth";
import { verifyGatewayRequest } from "@tanlan/jobber-shared";

const BASE_URL = 'api/v1/auth'
export function appRoutes(app: Application): void {
    app.use(BASE_URL, verifyGatewayRequest, authRoutes())
}