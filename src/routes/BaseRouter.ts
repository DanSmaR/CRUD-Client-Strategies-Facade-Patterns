import {Router} from "express";

export abstract class BaseRouter {
    protected readonly router: Router;

    protected constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    abstract initializeRoutes(): void;

    public getRouter(): Router {
        return this.router;
    }
}