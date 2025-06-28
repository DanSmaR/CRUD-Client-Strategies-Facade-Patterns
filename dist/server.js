"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const appConfig = new app_1.AppConfig();
const PORT = process.env.PORT || 3000;
appConfig.getApp().listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse http://localhost:${PORT} para ver a aplicação`);
});
