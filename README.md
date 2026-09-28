# GHW Dashboard

Central de reuso do escritório: o catálogo mostra as funções prontas para chamar, a ação **Importar arquivo** alimenta a base uma única vez e a vista **Dados normalizados** exibe quantidade e estado por empresa e tipo.

## Rodar a partir de um clone limpo

O código ainda vive no branch do PR draft (a `main` só tem o README). Node mínimo: **18**.

```bash
git clone https://github.com/phillipej/app
cd app
git checkout cursor/ghw-dashboard-inicial-c7fe
node --version   # precisa ser 18 ou maior
npm start        # sem instalar nada: zero dependências
```

Abra `http://localhost:8080` (porta padrão `8080`; para outra porta: `PORT=3000 npm start`).

Se `npm start` disser `Could not read package.json`, você está na `main` ou fora da pasta `app` — confira com `ls` (tem que listar `server.js`) e `git branch --show-current` (tem que mostrar `cursor/ghw-dashboard-inicial-c7fe`).
