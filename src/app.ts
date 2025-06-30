import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import expressLayouts from 'express-ejs-layouts';
import { ClientController } from './controllers/ClientController';
import { Facade } from './controllers/Facade';
import { ClientRepository } from './repositories/implementations/ClientRepository';
import { CpfValidationStrategy } from './strategies/implementations/CpfValidationStrategy';
import { DateComplementStrategy } from './strategies/implementations/DateComplementStrategy';
import { EmailValidationStrategy } from './strategies/implementations/EmailValidationStrategy';
import { PhoneValidationStrategy } from './strategies/implementations/PhoneValidationStrategy';
import { AddressValidationStrategy } from './strategies/implementations/AddressValidationStrategy';
import { BirthDateValidationStrategy } from './strategies/implementations/BirthDateValidationStrategy';
import { PasswordValidationStrategy } from './strategies/implementations/PasswordValidationStrategy';
import { createClientRoutes } from './routes/clientRoutes';
import {DatabaseSchema} from "./infrastructure/database/sqlite/DatabaseSchema";

export class AppConfig {
  private readonly app: express.Application;
  private facade!: Facade;
  private clientController!: ClientController;

  constructor() {
    this.app = express();
    this.initializeApp();
  }

  private initializeApp(): void {
    this.configureViewEngine();
    this.configureMiddlewares();
    this.initializeFacade();
    this.registerRepositories();
    this.registerStrategies();
    this.initializeControllers();
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

  private initializeFacade(): void {
    this.facade = new Facade();
  }

  private registerRepositories(): void {
    const clientRepository = new ClientRepository();
    this.facade.registerRepository('Client', clientRepository as any);
  }

  private registerStrategies(): void {
    const clientStrategies = [
      new CpfValidationStrategy(),
      new EmailValidationStrategy(),
      new PhoneValidationStrategy(),
      new AddressValidationStrategy(),
      new BirthDateValidationStrategy(),
      new PasswordValidationStrategy(),
      new DateComplementStrategy()
    ];
    this.facade.registerStrategies('Client', clientStrategies as any);
  }

  private initializeControllers(): void {
    this.clientController = new ClientController(this.facade);
  }

  private configureRoutes(): void {
    this.app.use('/clients', createClientRoutes(this.clientController));
    this.app.get('/', (req, res) => {
      res.redirect('/clients');
    });
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

