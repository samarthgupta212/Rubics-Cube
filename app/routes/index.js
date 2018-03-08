import initCubeRoutes from './cubeRoutes';

const initRoutes = (app) => {
  app.use('/cube', initCubeRoutes());
};

export default initRoutes;
