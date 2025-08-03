import { Logger } from 'winston'
import { winstonLogger } from 'jobber-shared-for-hkhanq'
import { config } from '@ai/config'

// Simple console logger for development when Elasticsearch is not available
class SimpleLogger {
  info(message: string, ...args: any[]): void {
    console.log(`[INFO] ${message}`, ...args)
  }

  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args)
  }

  log(level: string, message: string, ...args: any[]): void {
    console.log(`[${level.toUpperCase()}] ${message}`, ...args)
  }
}

// Create logger based on environment
export const createLogger = (service: string): Logger => {
  // For development without Elasticsearch, use simple console logger
  if (config.NODE_ENV === 'development' && (!config.ELASTIC_SEARCH_URL || config.ELASTIC_SEARCH_URL === '' || config.ELASTIC_SEARCH_URL === 'undefined')) {
    console.log(`[${service}] Using console logger for development`)
    return new SimpleLogger() as any
  }
  
  // For production or when Elasticsearch is available
  try {
    return winstonLogger(`${config.ELASTIC_SEARCH_URL}`, service, 'debug')
  } catch (error) {
    console.warn(`[${service}] Failed to create winston logger, falling back to console logger`)
    return new SimpleLogger() as any
  }
}