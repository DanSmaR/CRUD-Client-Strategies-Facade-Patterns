import express from 'express';
import { ClientController } from '../controllers/ClientController';

export function createClientRoutes(clientController: ClientController): express.Router {
  const router = express.Router();
  
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