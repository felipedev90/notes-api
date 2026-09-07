# notes-api

API REST de notas, multiusuário, construída do zero como projeto de aprendizado de arquitetura de backend em Node.js.

## Stack

- **Runtime/Framework**: Node.js, Express, TypeScript (ESM + `NodeNext`)
- **Banco de dados**: PostgreSQL, via Docker
- **ORM**: Prisma
- **Validação**: Zod
- **Autenticação**: JWT (`jsonwebtoken`) + hash de senha (`bcrypt`)
- **Testes**: Vitest
- **Qualidade**: ESLint, Prettier, Husky, lint-staged, commitlint (Conventional Commits)
- **CI**: GitHub Actions (lint, build, test)
- **Containerização**: Docker (multi-stage build) + Docker Compose

## Arquitetura

Organização **feature-first**, com separação estrita em 4 camadas por módulo:

```
src/
 ├── config/          → configuração de ambiente validada (Zod)
 ├── lib/              → infraestrutura compartilhada (ex: Prisma Client singleton)
 ├── errors/           → hierarquia de erros customizados (AppError e subclasses)
 ├── middlewares/       → error handler global, autenticação, validação, catchAsync
 ├── types/            → extensões de tipos globais (ex: Request.userId)
 ├── modules/
 │    ├── auth/
 │    │    ├── auth.route.ts        → mapeamento de rotas
 │    │    ├── auth.controller.ts   → orquestração HTTP (req/res)
 │    │    ├── auth.service.ts      → regra de negócio
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
 └── server.ts         → sobe o servidor HTTP
prisma/
 ├── schema.prisma
 └── migrations/
```

**Fluxo de uma requisição**: `route` → middlewares (`authenticate`, `validate`) → `controller` → `service` (regra de negócio, autorização) → `repository` (Prisma) → banco. Qualquer erro lançado em qualquer camada é capturado (via `catchAsync` em rotas assíncronas, ou diretamente em middlewares síncronos) e tratado pelo `errorHandler` global, garantindo formato de resposta consistente.

## Decisões de design

- **`app.ts` separado de `server.ts`**: permite testar o Express app sem abrir uma porta TCP real.
- **Fail-fast em configuração crítica**: `DATABASE_URL` e `JWT_SECRET` são obrigatórias, sem valor padrão — o servidor recusa subir se estiverem ausentes ou inválidas. `PORT` tem fallback (`3000`), por ser de menor risco.
- **Hierarquia de erros customizados** (`AppError` e subclasses `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`): cada uma carrega seu `statusCode` HTTP correspondente, permitindo que qualquer camada apenas `throw` o erro certo e delegue a formatação da resposta ao middleware global.
- **`401` vs `403`**: `401` significa "não sei quem você é" (sem token, token inválido); `403` significa "sei quem você é, mas você não pode fazer isso" (ex: mexer em nota de outro usuário).
- **Autorização por dono de recurso**: toda operação sobre uma nota específica (`get`, `update`, `delete`) primeiro busca o recurso, confere existência (`404` se não existir) e depois confere posse (`403` se existir mas não pertencer ao usuário autenticado) — essa lógica mora no `service`, nunca no `controller` ou `repository`.
- **Erro genérico no login**: "usuário não existe" e "senha incorreta" retornam a mesma mensagem (`401 Unauthorized`), para evitar ataques de enumeração de usuários.
- **`passwordHash` nunca trafega na resposta HTTP**: removido via destructuring antes de qualquer resposta que inclua dados de usuário.
- **Middleware de validação genérico** (`validate(schema)`): fábrica reutilizável que aplica qualquer schema Zod a `req.body`, lançando `ValidationError` (400, com detalhes estruturados via `z.treeifyError`) em caso de falha.

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

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor com watch mode (`tsx`) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm run lint` | Roda o ESLint |
| `npm run lint:fix` | Roda o ESLint com correção automática |
| `npm run format` | Formata o código com Prettier |
| `npm test` | Roda a suíte de testes (Vitest) |

## Endpoints

### Auth (`/auth`)

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| POST | `/auth/register` | não | Cria um novo usuário |
| POST | `/auth/login` | não | Autentica e retorna um JWT |
| GET | `/auth/me` | sim | Retorna o `userId` do token autenticado |

### Notes (`/notes`)

Todas as rotas exigem autenticação (`Authorization: Bearer <token>`).

| Método | Rota | Descrição |
|---|---|---|
| POST | `/notes` | Cria uma nova nota |
| GET | `/notes` | Lista as notas do usuário autenticado |
| GET | `/notes/:id` | Busca uma nota específica (apenas se for o dono) |
| PATCH | `/notes/:id` | Atualiza parcialmente uma nota (apenas se for o dono) |
| DELETE | `/notes/:id` | Remove uma nota (apenas se for o dono) |

## Testes

Cobertura de testes unitários sobre:
- Hierarquia de erros (`AppError` e subclasses)
- `catchAsync` (captura de rejeição de Promise assíncrona)
- `validate` (middleware de validação com schemas reais)
- `authenticate` (middleware de autenticação JWT, todos os caminhos de falha)
- `auth.service` (registro e login, incluindo checagem de e-mail duplicado e credenciais inválidas)
- `notes.service` (CRUD completo, incluindo os cenários de autorização — recurso inexistente e recurso de outro usuário)

```bash
npm test
```

## CI

GitHub Actions (`quality-checks`) roda em todo push e pull request para `main`: instalação de dependências, lint, build e testes.

## Roadmap

Este é o **V1** do projeto: fundamentos de um backend robusto (camadas, erros, validação, autenticação, autorização, testes).

Próximas etapas planejadas:
- **V2**: refresh tokens com rotação/revogação, rate limiting no login
- **V3**: BullMQ + Redis para processamento assíncrono, cache de leitura, paginação
- **V4**: logging estruturado (pino), healthcheck, graceful shutdown, testes de integração com Supertest