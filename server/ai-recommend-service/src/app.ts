// Load environment variables first
import * as dotenv from 'dotenv'
dotenv.config()

import { databaseConnection } from '@ai/database'
import { config } from '@ai/config'
import express, { Express } from 'express'
import { start } from '@ai/server'
import { redisConnect } from '@ai/redis/redis.connection'

const initialize = (): void => {
  databaseConnection()
  const app: Express = express()
  start(app)
  redisConnect()
}

initialize()