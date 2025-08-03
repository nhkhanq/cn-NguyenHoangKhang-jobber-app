import * as dotenv from 'dotenv'

dotenv.config()

class Config {
  public GATEWAY_JWT_TOKEN: string | undefined
  public JWT_TOKEN: string | undefined
  public NODE_ENV: string | undefined
  public API_GATEWAY_URL: string | undefined
  public REDIS_HOST: string | undefined
  public REDIS_PORT: string | undefined
  public DATABASE_URL: string | undefined
  public CLIENT_URL: string | undefined
  public PORT: string | undefined
  public RABBITMQ_ENDPOINT: string | undefined
  public ELASTIC_SEARCH_URL: string | undefined
  public ELASTIC_APM_SERVER_URL: string | undefined
  public ELASTIC_APM_SECRET_TOKEN: string | undefined
  public ENABLE_APM: string | undefined
  
  // AI Service specific
  public OPENAI_API_KEY: string | undefined
  public GIG_SERVICE_URL: string | undefined
  public USERS_SERVICE_URL: string | undefined
  public ORDER_SERVICE_URL: string | undefined
  public USE_OPENAI: string | undefined

  constructor() {
    this.GATEWAY_JWT_TOKEN = process.env.GATEWAY_JWT_TOKEN || undefined
    this.JWT_TOKEN = process.env.JWT_TOKEN || undefined
    this.NODE_ENV = process.env.NODE_ENV || undefined
    this.API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000'
    this.REDIS_HOST = process.env.REDIS_HOST || undefined
    this.REDIS_PORT = process.env.REDIS_PORT || '6379'
    this.DATABASE_URL = process.env.MONGODB_URL || process.env.DATABASE_URL || undefined
    this.CLIENT_URL = process.env.CLIENT_URL || undefined
    this.PORT = process.env.PORT || '4009'
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || undefined
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || undefined
    this.ELASTIC_APM_SERVER_URL = process.env.ELASTIC_APM_SERVER_URL || undefined
    this.ELASTIC_APM_SECRET_TOKEN = process.env.ELASTIC_APM_SECRET_TOKEN || undefined
    this.ENABLE_APM = process.env.ENABLE_APM || '0'
    
    // AI Service specific
    this.OPENAI_API_KEY = process.env.OPENAI_API_KEY || undefined
    this.GIG_SERVICE_URL = process.env.GIG_SERVICE_URL || 'http://localhost:4004/api/v1'
    this.USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://localhost:4003/api/v1'
    this.ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:4006/api/v1'
    this.USE_OPENAI = process.env.USE_OPENAI || 'true'
  }
}

export const config: Config = new Config()