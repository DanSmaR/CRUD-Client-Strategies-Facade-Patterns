import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import expressLayouts from 'express-ejs-layouts';
import {DatabaseSchema} from "./infrastructure/database/sqlite/DatabaseSchema";
import {IndexRouter} from "./routes/IndexRouter";

export class AppConfig {
  private readonly app: express.Application;

  constructor() {
    this.app = express();
    this.initializeApp();
  }

  private initializeApp(): void {
    this.configureViewEngine();
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
    this.initializeDatabase();

  }

  private initializeDatabase(): void {
    const dbSchema = new DatabaseSchema();
    dbSchema.initializeSchema()
      .then(() => console.log('Database schema initialized successfully'))
      .catch(err => console.error('Error initializing database schema:', err));
  }

  private configureViewEngine(): void {
    this.app.use(expressLayouts);
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.set('layout', 'layouts/main'); // Set default layout
  }

  private configureMiddlewares(): void {
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    this.app.use(cors());
  }

  private configureRoutes(): void {
    this.app.use('/', new IndexRouter().getRouter());
  }

  private configureErrorHandling(): void {
    this.app.use((req, res) => {
      res.status(404).render('error', { message: 'Página não encontrada' });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

