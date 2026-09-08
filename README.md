# notes-api

API REST de notas, multiusuário, construída do zero como projeto de aprendizado de arquitetura de backend em Node.js.

## Stack

- **Runtime/Framework**: Node.js, Express, TypeScript (ESM + `NodeNext`)
- **Banco de dados**: PostgreSQL, via Docker
- **ORM**: Prisma
- **Validação**: Zod
- **Autenticação**: JWT (`jsonwebtoken`, access + refresh token com rotação) + hash de senha (`bcrypt`)
- **Rate limiting**: `express-rate-limit`
- **Logging**: `pino` / `pino-http` (estruturado, JSON em produção, formatado em dev)
- **Testes**: Vitest (unitários) + Supertest (integração)
- **Qualidade**: ESLint, Prettier, Husky, lint-staged, commitlint (Conventional Commits)
- **CI**: GitHub Actions (lint, build, testes unitários e de integração contra Postgres real)
- **Containerização**: Docker (multi-stage build) + Docker Compose (banco de desenvolvimento e banco de teste isolados)

## Arquitetura

Organização **feature-first**, com separação estrita em 4 camadas por módulo:

```
src/
 ├── config/          → configuração de ambiente validada (Zod)
 ├── lib/              → infraestrutura compartilhada (Prisma Client singleton, logger)
 ├── errors/           → hierarquia de erros customizados (AppError e subclasses)
 ├── middlewares/       → error handler global, autenticação, validação, catchAsync, rate limiter
 ├── types/            → extensões de tipos globais (Request.userId, Request.validatedQuery)
 ├── modules/
 │    ├── auth/
 │    │    ├── auth.route.ts        → mapeamento de rotas
 │    │    ├── auth.controller.ts   → orquestração HTTP (req/res)
 │    │    ├── auth.service.ts      → regra de negócio (auth, tokens)
 │    │    ├── auth.repository.ts   → acesso a dados (Prisma)
 │    │    ├── auth.schema.ts       → validação Zod de entrada
 │    │    └── password.ts          → hash e comparação de senha
 │    └── notes/
 │         ├── notes.route.ts
 │         ├── notes.controller.ts
 │         ├── notes.service.ts
 │         ├── notes.repository.ts
 │         └── notes.schema.ts
 ├── app.ts            → monta o Express app (sem side effects de rede)
 ├── app.test.ts       → testes de integração (Supertest)
 └── server.ts         → sobe o servidor HTTP
prisma/
 ├── schema.prisma
 └── migrations/
```

**Fluxo de uma requisição**: `route` → middlewares (`authenticate`, `validate`, rate limiter) → `controller` → `service` (regra de negócio, autorização) → `repository` (Prisma) → banco. Qualquer erro lançado em qualquer camada é capturado (via `catchAsync` em rotas assíncronas, ou diretamente em middlewares síncronos) e tratado pelo `errorHandler` global, garantindo formato de resposta consistente.

## Decisões de design

- **`app.ts` separado de `server.ts`**: permite testar o Express app sem abrir uma porta TCP real — é o que possibilita os testes de integração com Supertest.
- **Fail-fast em configuração crítica**: `DATABASE_URL` e `JWT_SECRET` são obrigatórias, sem valor padrão — o servidor recusa subir se estiverem ausentes ou inválidas. `PORT` e `NODE_ENV` têm fallback, por serem de menor risco.
- **Hierarquia de erros customizados** (`AppError` e subclasses `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`): cada uma carrega seu `statusCode` HTTP correspondente, permitindo que qualquer camada apenas `throw` o erro certo e delegue a formatação da resposta ao middleware global.
- **`401` vs `403`**: `401` significa "não sei quem você é" (sem token, token inválido); `403` significa "sei quem você é, mas você não pode fazer isso" (ex: mexer em nota de outro usuário).
- **Autorização por dono de recurso**: toda operação sobre uma nota específica (`get`, `update`, `delete`) primeiro busca o recurso, confere existência (`404` se não existir) e depois confere posse (`403` se existir mas não pertencer ao usuário autenticado) — essa lógica mora no `service`, nunca no `controller` ou `repository`.
- **Erro genérico no login**: "usuário não existe" e "senha incorreta" retornam a mesma mensagem (`401 Unauthorized`), para evitar ataques de enumeração de usuários.
- **`passwordHash` nunca trafega na resposta HTTP**: removido via destructuring antes de qualquer resposta que inclua dados de usuário.
- **Middleware de validação genérico** (`validate(schema, source)`): fábrica reutilizável que aplica qualquer schema Zod a `req.body` ou `req.query`. Como `req.query` é somente-leitura no Express 5, o resultado validado de query strings é guardado em `req.validatedQuery`, não sobrescrito diretamente.
- **Access token + refresh token com rotação**: o access token (JWT) tem vida curta (15 min) e nunca é persistido; o refresh token é uma string aleatória de vida longa (7 dias), salva no banco — o que permite revogação real (logout, rotação a cada uso), algo que um JWT sozinho não permite antes de expirar naturalmente.
- **Rate limiting em rotas de autenticação**: `/auth/login` e `/auth/register` limitados a 5 tentativas por 15 minutos por IP, para dificultar força bruta.
- **Índices de banco**: `Note.userId` e `RefreshToken.userId` indexados (`@@index`), já que são usados com frequência em `WHERE` e não têm `@unique` (que já geraria índice automático, como em `User.email`).
- **Logging estruturado**: erros e requisições HTTP logados via `pino`, em JSON estruturado (produção) ou formatado (`pino-pretty`, desenvolvimento) — nunca `console.log` solto.
- **Healthcheck real**: `GET /health` executa uma query mínima no banco (`SELECT 1`) antes de responder `200`; se o banco estiver inacessível, responde `503`.
- **Testes de integração com banco isolado**: Supertest executa requisições reais contra o `app` (sem porta TCP aberta), usando um banco Postgres de teste separado (`docker-compose`, porta `5433`), garantindo que os testes não afetem dados de desenvolvimento.
- **BullMQ/Redis descartados conscientemente**: avaliados no roadmap original, mas descartados por não haver nenhuma operação genuinamente assíncrona/lenta no domínio atual da aplicação — adicionar fila de jobs sem necessidade real seria over-engineering.

## Como rodar localmente

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### Setup

1. Clone o repositório e instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz com:

   ```
   PORT=3000
   DATABASE_URL=postgresql://notes_user:sua_senha@localhost:5432/notes_db
   JWT_SECRET=uma-string-longa-e-aleatoria
   NODE_ENV=development
   ```

   As credenciais de `DATABASE_URL` devem bater com as definidas em `docker-compose.yml`.

3. Suba apenas o banco de dados (para desenvolvimento local com `npm run dev`):

   ```bash
   docker compose up -d postgres
   ```

4. Rode as migrations:

   ```bash
   npx prisma migrate dev
   ```

5. Inicie o servidor em modo desenvolvimento:
   ```bash
   npm run dev
   ```

### Rodando tudo via Docker

```bash
docker compose up --build
```

Sobe o app e o Postgres juntos, com a `DATABASE_URL` apontando para o serviço `postgres` pelo nome (rede interna do Compose).

### Banco de testes de integração

Os testes de integração (Supertest) rodam contra um banco Postgres isolado, exposto na porta `5433`:

```bash
docker compose up -d postgres-test
```

Crie um arquivo `.env.test` na raiz com:

```
PORT=3000
DATABASE_URL=postgresql://notes_user:sua_senha@localhost:5433/notes_test_db
JWT_SECRET=test-secret
NODE_ENV=test
```

Aplique as migrations nesse banco:

```bash
npx dotenv -e .env.test -- npx prisma migrate deploy
```

## Scripts disponíveis

| Comando                    | Descrição                                                        |
| -------------------------- | ---------------------------------------------------------------- |
| `npm run dev`              | Inicia o servidor com watch mode (`tsx`)                         |
| `npm run build`            | Compila TypeScript para `dist/`                                  |
| `npm run lint`             | Roda o ESLint                                                    |
| `npm run lint:fix`         | Roda o ESLint com correção automática                            |
| `npm run format`           | Formata o código com Prettier                                    |
| `npm test`                 | Roda a suíte de testes unitários (Vitest)                        |
| `npm run test:integration` | Roda os testes de integração (Supertest) contra o banco de teste |

## Endpoints

### Health

| Método | Rota      | Descrição                                               |
| ------ | --------- | ------------------------------------------------------- |
| GET    | `/health` | Verifica se a API e o banco de dados estão operacionais |

### Auth (`/auth`)

| Método | Rota             | Autenticação       | Rate limit | Descrição                                                         |
| ------ | ---------------- | ------------------ | ---------- | ----------------------------------------------------------------- |
| POST   | `/auth/register` | não                | sim        | Cria um novo usuário                                              |
| POST   | `/auth/login`    | não                | sim        | Autentica e retorna access + refresh token                        |
| POST   | `/auth/refresh`  | não                | não        | Troca um refresh token válido por um novo par de tokens (rotação) |
| POST   | `/auth/logout`   | não                | não        | Revoga um refresh token                                           |
| GET    | `/auth/me`       | sim (access token) | não        | Retorna o `userId` do token autenticado                           |

### Notes (`/notes`)

Todas as rotas exigem autenticação (`Authorization: Bearer <access_token>`).

| Método | Rota                     | Descrição                                                                                               |
| ------ | ------------------------ | ------------------------------------------------------------------------------------------------------- |
| POST   | `/notes`                 | Cria uma nova nota                                                                                      |
| GET    | `/notes?page=&pageSize=` | Lista as notas do usuário autenticado, paginado (padrão: página 1, 10 por página, máximo 50 por página) |
| GET    | `/notes/:id`             | Busca uma nota específica (apenas se for o dono)                                                        |
| PATCH  | `/notes/:id`             | Atualiza parcialmente uma nota (apenas se for o dono; exige ao menos um campo)                          |
| DELETE | `/notes/:id`             | Remove uma nota (apenas se for o dono)                                                                  |

## Testes

### Unitários (`npm test`)

- Hierarquia de erros (`AppError` e subclasses)
- `catchAsync` (captura de rejeição de Promise assíncrona)
- `validate` (middleware de validação com schemas reais, body e query)
- `authenticate` (middleware de autenticação JWT, todos os caminhos de falha)
- `auth.service`: registro, login, logout, geração e rotação de refresh tokens
- `notes.service`: CRUD completo, incluindo os cenários de autorização (recurso inexistente e recurso de outro usuário)

### Integração (`npm run test:integration`)

- Requisições reais via Supertest contra o `app`, passando pela pilha completa de middlewares/rotas/controllers/services/repositories, contra um banco Postgres de teste real.

## CI

GitHub Actions (`quality-checks`) roda em todo push e pull request para `main`:

1. Instala dependências e gera o Prisma Client
2. Lint e build
3. Sobe um serviço Postgres (via `services` do Actions) e aplica as migrations
4. Roda os testes unitários e de integração contra esse banco

## Releases

O projeto segue tags anotadas + GitHub Releases para marcar marcos do roadmap:

- `v1.0.0`: fundamentos — camadas, erros, validação, autenticação, autorização, testes
- `v1.1.0`: refresh tokens com rotação, logout, rate limiting
