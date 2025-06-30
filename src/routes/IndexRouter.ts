import {BaseRouter} from "./BaseRouter";
import {ClientRouter} from "./ClientRouter";

export class IndexRouter extends BaseRouter {
    constructor() {
        super();
    }

    initializeRoutes() {
        this.router.use('/clients', new ClientRouter().getRouter());
        this.router.get('/', (req, res) => res.redirect('/clients'));
    }
}