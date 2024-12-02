import { databaseConnection } from '@users/database'
import { config } from '@users/config'
import express, { Express } from 'express'

const initilize = (): void => {
  config.cloudinaryConfig()
  databaseConnection()
}

initilize()