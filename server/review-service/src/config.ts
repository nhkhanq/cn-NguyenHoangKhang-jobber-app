import * as dotenv from 'dotenv'
import cloudinary from 'cloudinary' 

dotenv.config()


class Config {
  public DATABASE_HOST: string | undefined
  public DATABASE_USER: string | undefined
  public DATABASE_PASSWORD: string | undefined
  public DATABASE_NAME: string | undefined
  public NODE_ENV: string | undefined
  public RABBITMQ_ENDPOINT: string | undefined
  public JWT_TOKEN: string | undefined
  public CLOUD_NAME: string | undefined
  public CLOUD_API_KEY: string | undefined
  public CLOUD_API_SECRET: string | undefined
  public GATEWAY_JWT_TOKEN: string | undefined
  public API_GATEWAY_URL: string | undefined
  public ELASTIC_SEARCH_URL: string | undefined
  public CLUSTER_TYPE: string | undefined
  constructor() {
    this.DATABASE_HOST = process.env.DATABASE_HOST || ''
    this.DATABASE_USER = process.env.DATABASE_USER || ''
    this.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || ''
    this.DATABASE_NAME = process.env.DATABASE_NAME || ''
    this.NODE_ENV = process.env.NODE_ENV || ''
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || ''
    this.JWT_TOKEN = process.env.JWT_TOKEN || ''
    this.CLOUD_NAME = process.env.CLOUD_NAME || ''
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || ''
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || ''
    this.GATEWAY_JWT_TOKEN = process.env.GATEWAY_JWT_TOKEN || ''
    this.API_GATEWAY_URL = process.env.API_GATEWAY_URL || ''
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || ''
    this.CLUSTER_TYPE = process.env.CLUSTER_TYPE || ''
  }

  public cloudinaryConfig(): void {
      cloudinary.v2.config({
        cloud_name: this.CLOUD_NAME,
        api_key: this.CLOUD_API_KEY,
        api_secret: this.CLOUD_API_SECRET
      })
  }
}

export const config: Config = new Config()