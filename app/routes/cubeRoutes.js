import express from 'express';
import CubeController from '../controllers/cubeController';

const initCubeRoutes = () => {
  const cubeRoutes = express.Router();

  cubeRoutes.post('/', CubeController.startNewGame);
  cubeRoutes.get('/:playerId', CubeController.configuration);
  cubeRoutes.get('/', CubeController.getAllPlayers);
  cubeRoutes.put('/:playerId', CubeController.changeCubeConfiguration);
  cubeRoutes.put('/:playerId/face', CubeController.changeActiveFace);

  return cubeRoutes;
};

export default initCubeRoutes;
