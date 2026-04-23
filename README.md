# CP5 — API demo para CI/CD (Azure DevOps)

Projeto mínimo em **Node.js + Express** com **testes (Jest)**, **Dockerfile**, **Docker Compose** (API + PostgreSQL: rede, volume e variáveis de ambiente) e **`azure-pipelines.yml`** com estágios de build, testes e deploy em **staging** e **produção**.

## Rodar localmente (sem Docker)

```powershell
cd cp5_devops
npm install
npm start
```

Abra `http://localhost:3000/health`. Sem `DATABASE_URL`, a API sobe sem banco; `GET /api/items` retorna lista vazia.

## Rodar com Docker Compose

```powershell
cd cp5_devops
# Opcional: copie .env.example para .env e altere senhas
docker compose up --build
```

- **Rede:** `cp5_appnet` (bridge) entre `api` e `db`.
- **Volume:** `cp5_pgdata` persiste dados do PostgreSQL.
- **Variáveis:** credenciais do Postgres e `DATABASE_URL` montada na API.

Testes: `POST http://localhost:3000/api/items` com corpo JSON `{"name":"item 1"}`.

## Azure DevOps — colocar o pipeline

1. Crie um repositório no Azure DevOps e envie este código (`git init`, `git remote add`, `git push`).
2. **Pipelines** → **New pipeline** → Azure Repos Git → escolha o repo → **Existing Azure Pipelines YAML file** → selecione `/azure-pipelines.yml`.
3. **Environments** (para aprovações entre staging e produção): **Pipelines** → **Environments** → crie `staging` e `production` (opcional: adicione aprovadores em **production**).
4. **Service connections**
   - **Azure Resource Manager** para o deploy no Web App (nome sugerido na variável `AZURE_SUBSCRIPTION`).
   - **Docker Registry** apontando para o **Azure Container Registry** (`ACR_SERVICE_CONNECTION`).
5. **Variáveis do pipeline** (editar o pipeline → **Variables** ou grupo na Library), por exemplo:

| Variável | Descrição |
|----------|-----------|
| `ACR_LOGIN_SERVER` | Ex.: `meuacr.azurecr.io` |
| `ACR_SERVICE_CONNECTION` | Nome da service connection do Docker Registry / ACR |
| `AZURE_SUBSCRIPTION` | Nome da service connection ARM |
| `RESOURCE_GROUP` | Resource group dos Web Apps |
| `STAGING_WEBAPP_NAME` | Nome do Web App de **staging** |
| `PRODUCTION_WEBAPP_NAME` | Nome do Web App de **produção** |

No portal Azure, cada Web App for Containers deve usar a mesma imagem do ACR; o pipeline só atualiza a tag da imagem. Configure `DATABASE_URL` (ou Azure Database for PostgreSQL) nas **Application settings** de cada ambiente se for usar banco na nuvem.

### Só CI (sem Azure ainda)

Se ainda não tiver ACR/Web Apps, no `azure-pipelines.yml` comente ou remova os estágios `DeployStaging` e `DeployProduction` e mantenha apenas o estágio `Build` (build + `npm test` + `docker build`).

## Estrutura

- `src/app.js` — rotas e fábrica do Express.
- `src/server.js` — sobe o servidor e cria tabela no Postgres quando há `DATABASE_URL`.
- `tests/app.test.js` — testes automatizados usados no pipeline.
- `Dockerfile` — imagem de produção (Node 20 Alpine).
- `docker-compose.yml` — orquestração API + Postgres.
