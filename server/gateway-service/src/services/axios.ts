import axios from "axios"
import { sign } from 'jsonwebtoken'
import { config } from '@gateway/config'

export class AxiosService {
    public axios: ReturnType<typeof axios.create>
  
    constructor(baseUrl: string, serviceName: string) {
      this.axios = this.axiosCreateInstance(baseUrl, serviceName)
    }
  
    public axiosCreateInstance(baseUrl: string, serviceName?: string): ReturnType<typeof axios.create> {
      let requestGatewayToken = ''
      if (serviceName) {
        requestGatewayToken = sign({ id: serviceName }, `${config.GATEWAY_JWT_TOKEN}`)
      }
      const instance: ReturnType<typeof axios.create> = axios.create({
        baseURL: baseUrl,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          gatewaytoken: requestGatewayToken
        },
        withCredentials: true
      })
      return instance
    }
  }

//const axiosTest = new AxiosService(`${config.AUTH_BASE_URL}/api/v1/auth`, 'auth')