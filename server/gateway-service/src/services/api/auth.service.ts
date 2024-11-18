import axios from "axios";
import { AxiosService } from "../axios";
import { config } from "@gateway/config";

export let axiosAuthInstance: ReturnType<typeof axios.create>

class AuthtService {
    axiosService: AxiosService

    constructor() {
        this.axiosService = new AxiosService(`$${config.AUTH_BASE_URL}/api/v1/auth`, 'auth')
        axiosAuthInstance = this.axiosService.axios
    }
}

export const authService: AuthtService = new AuthtService()