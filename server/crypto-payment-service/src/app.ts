import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import { config } from './config';
import cryptoRoutes from './routes/crypto.routes';

class Application {
  private app: Express;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.connectToDatabase();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors({
      origin: config.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }));
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        service: 'Crypto Payment Service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    this.app.use('/api/v1/crypto', cryptoRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl
      });
    });
  }

  private async connectToDatabase(): Promise<void> {
    try {
      await mongoose.connect(config.DATABASE_URL!);
      console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  public start(): void {
    const PORT = config.PORT || 4012;
    
    this.app.listen(PORT, () => {
      console.log(`🚀 Crypto Payment Service running on port ${PORT}`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  }

  public getApp(): Express {
    return this.app;
  }
}

// Start the application
const application = new Application();
application.start();

export default application.getApp(); 