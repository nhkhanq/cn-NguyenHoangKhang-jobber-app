import * as dotenv from 'dotenv'
import cloudinary from 'cloudinary' 

dotenv.config();

class Config {
   public GATEWAY_JWT_TOKEN: string | undefined
   public JWT_TOKEN: string | undefined
   public NODE_ENV: string | undefined
   public API_GATEWAY_URL: string | undefined
   public REDIS_HOST: string | undefined
   public CLIENT_URL: string | undefined
   public MYSQL_DB: string | undefined
   public CLOUD_NAME: string | undefined
   public CLOUD_API_KEY: string | undefined
   public CLOUD_API_SECRET: string | undefined
   public RABBITMQ_ENDPOINT: string | undefined
   public ELASTIC_SEARCH_URL: string | undefined

  constructor() {
    this.GATEWAY_JWT_TOKEN = process.env.GATEWAY_JWT_TOKEN || undefined
    this.JWT_TOKEN = process.env.JWT_TOKEN || undefined
    this.NODE_ENV = process.env.NODE_ENV || undefined
    this.API_GATEWAY_URL = process.env.API_GATEWAY_URL || undefined
    this.REDIS_HOST = process.env.REDIS_HOST || undefined
    this.CLIENT_URL = process.env.CLIENT_URL || undefined
    this.MYSQL_DB = process.env.MYSQL_DB || undefined
    this.CLOUD_NAME = process.env.CLOUD_NAME || undefined
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || undefined
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || undefined
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || undefined
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || undefined 
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