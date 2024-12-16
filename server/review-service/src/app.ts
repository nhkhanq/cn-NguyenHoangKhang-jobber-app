import { databaseConnection } from '@review/database'
import { config } from '@review/config'
import express, { Express } from 'express'
import { start } from '@review/server'

const initilize = (): void => {
  config.cloudinaryConfig()
  databaseConnection()
  const app: Express = express()
  start(app)
}

initilize()