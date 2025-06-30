import {ClientController} from "../controllers/ClientController";
import { ClientRepository } from "../repositories/implementations/ClientRepository";
import {CpfValidationStrategy} from "../strategies/implementations/CpfValidationStrategy";
import {EmailValidationStrategy} from "../strategies/implementations/EmailValidationStrategy";
import {PhoneValidationStrategy} from "../strategies/implementations/PhoneValidationStrategy";
import {AddressValidationStrategy} from "../strategies/implementations/AddressValidationStrategy";
import {BirthDateValidationStrategy} from "../strategies/implementations/BirthDateValidationStrategy";
import {PasswordValidationStrategy} from "../strategies/implementations/PasswordValidationStrategy";
import {DateComplementStrategy} from "../strategies/implementations/DateComplementStrategy";
import {IStrategy} from "../strategies/interfaces/IStrategy";
import {DomainEntity} from "../domain/entities/DomainEntity";
import {Facade} from "../controllers/Facade";
import {Client} from "../domain/entities/Client";
import {BaseRouter} from "./BaseRouter";

export class ClientRouter extends BaseRouter {
    private readonly clientController: ClientController;

    constructor() {
        super();
        const clientRepository = new ClientRepository();
        const strategies: IStrategy<DomainEntity>[] = [
            new CpfValidationStrategy(),
            new EmailValidationStrategy(),
            new PhoneValidationStrategy(),
            new AddressValidationStrategy(),
            new BirthDateValidationStrategy(),
            new PasswordValidationStrategy(),
            new DateComplementStrategy()
        ];
        const facade = new Facade(new Map([[Client.name, strategies]]), new Map([[Client.name, clientRepository]]));
        this.clientController = new ClientController(facade);
    }

    public initializeRoutes(): void {
        this.router.get('/', (req, res) => this.clientController.index(req, res));
        this.router.get('/new', (req, res) => this.clientController.new(req, res));
        this.router.post('/', (req, res) => this.clientController.create(req, res));
        this.router.get('/:id', (req, res) => this.clientController.show(req, res));
        this.router.get('/:id/edit', (req, res) => this.clientController.edit(req, res));
        this.router.post('/:id', (req, res) => this.clientController.update(req, res));
        this.router.post('/:id/activate', (req, res) => this.clientController.activate(req, res));
        this.router.post('/:id/deactivate', (req, res) => this.clientController.deactivate(req, res));
        this.router.post('/:id/delete', (req, res) => this.clientController.delete(req, res));
    }
}