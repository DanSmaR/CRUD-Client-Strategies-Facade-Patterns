"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfig = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_ejs_layouts_1 = __importDefault(require("express-ejs-layouts"));
const ClientController_1 = require("./controllers/ClientController");
const Facade_1 = require("./controllers/Facade");
const ClientRepository_1 = require("./repositories/implementations/ClientRepository");
const CpfValidationStrategy_1 = require("./strategies/implementations/CpfValidationStrategy");
const DateComplementStrategy_1 = require("./strategies/implementations/DateComplementStrategy");
const EmailValidationStrategy_1 = require("./strategies/implementations/EmailValidationStrategy");
const PhoneValidationStrategy_1 = require("./strategies/implementations/PhoneValidationStrategy");
const AddressValidationStrategy_1 = require("./strategies/implementations/AddressValidationStrategy");
const BirthDateValidationStrategy_1 = require("./strategies/implementations/BirthDateValidationStrategy");
const PasswordValidationStrategy_1 = require("./strategies/implementations/PasswordValidationStrategy");
const clientRoutes_1 = require("./routes/clientRoutes");
class AppConfig {
    constructor() {
        this.app = (0, express_1.default)();
        this.initializeApp();
    }
    initializeApp() {
        this.configureViewEngine();
        this.configureMiddlewares();
        this.initializeFacade();
        this.registerRepositories();
        this.registerStrategies();
        this.initializeControllers();
        this.configureRoutes();
        this.configureErrorHandling();
    }
    configureViewEngine() {
        this.app.use(express_ejs_layouts_1.default);
        this.app.set('view engine', 'ejs');
        this.app.set('views', path_1.default.join(__dirname, 'views'));
        this.app.set('layout', 'layouts/main'); // Set default layout
    }
    configureMiddlewares() {
        this.app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
        this.app.use(body_parser_1.default.urlencoded({ extended: true }));
        this.app.use(body_parser_1.default.json());
        this.app.use((0, cors_1.default)());
    }
    initializeFacade() {
        this.facade = new Facade_1.Facade();
    }
    registerRepositories() {
        const clientRepository = new ClientRepository_1.ClientRepository();
        this.facade.registerRepository('Client', clientRepository);
    }
    registerStrategies() {
        const clientStrategies = [
            new CpfValidationStrategy_1.CpfValidationStrategy(),
            new EmailValidationStrategy_1.EmailValidationStrategy(),
            new PhoneValidationStrategy_1.PhoneValidationStrategy(),
            new AddressValidationStrategy_1.AddressValidationStrategy(),
            new BirthDateValidationStrategy_1.BirthDateValidationStrategy(),
            new PasswordValidationStrategy_1.PasswordValidationStrategy(),
            new DateComplementStrategy_1.DateComplementStrategy()
        ];
        this.facade.registerStrategies('Client', clientStrategies);
    }
    initializeControllers() {
        this.clientController = new ClientController_1.ClientController(this.facade);
    }
    configureRoutes() {
        this.app.use('/clients', (0, clientRoutes_1.createClientRoutes)(this.clientController));
        this.app.get('/', (req, res) => {
            res.redirect('/clients');
        });
    }
    configureErrorHandling() {
        this.app.use((req, res) => {
            res.status(404).render('error', { message: 'Página não encontrada' });
        });
    }
    getApp() {
        return this.app;
    }
}
exports.AppConfig = AppConfig;
