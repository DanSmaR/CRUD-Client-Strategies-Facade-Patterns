"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientRoutes = createClientRoutes;
const express_1 = __importDefault(require("express"));
function createClientRoutes(clientController) {
    const router = express_1.default.Router();
    router.get('/', clientController.index.bind(clientController));
    router.get('/new', clientController.new.bind(clientController));
    router.post('/', clientController.create.bind(clientController));
    router.get('/:id', clientController.show.bind(clientController));
    router.get('/:id/edit', clientController.edit.bind(clientController));
    router.post('/:id', clientController.update.bind(clientController));
    router.post('/:id/activate', clientController.activate.bind(clientController));
    router.post('/:id/deactivate', clientController.deactivate.bind(clientController));
    router.post('/:id/delete', clientController.delete.bind(clientController));
    return router;
}
