import { AppConfig } from './app';

const appConfig = new AppConfig();
const PORT = process.env.PORT || 3000;

appConfig.getApp().listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse http://localhost:${PORT} para ver a aplicação`);
});
