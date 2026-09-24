# Leilao Retro - Full Stack

<div align="center">
  <img src="./imagens/preciso_animar_o_gato_batendo.gif" alt="Topo animado do projeto" width="100%" />
</div>

<div align="center">
  <img src="./imagens/watermarked_img_2254319071215094713.jpg" alt="Logo do projeto" width="260" />

  <h3>Plataforma de leiloes de jogos e videogames antigos</h3>
</div>

## Sobre o projeto

Este repositorio contem um projeto **full stack** para um site de leiloes focado em:

- Consoles retro
- Jogos/midias antigas
- Registro de lances de usuarios

O backend esta em Node.js + Express + Prisma (PostgreSQL), e o frontend esta em React + Vite + TypeScript.

## Estrutura

```text
Back/   -> API, regras de negocio e acesso ao banco
Front/  -> Aplicacao web React
imagens/ -> Arquivos visuais usados no README
```

## Tecnologias

### Backend

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Zod (validacao)
- CORS

### Frontend

- React
- Vite
- TypeScript
- React Router
- Tailwind CSS

> Observacao: existem referencias a "carros" no frontend atual (nome de projeto/tipos/componentes). Essa parte deve ser **ignorada por enquanto**, pois sera ajustada para o contexto de leiloes de jogos e videogames.

## Como executar

## 1) Backend

Entre na pasta:

```bash
cd Back
```

Instale dependencias:

```bash
npm install
```

Crie um arquivo `.env` com a conexao do PostgreSQL:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
```

Aplique as migracoes:

```bash
npx prisma migrate dev
```

Inicie o servidor:

```bash
npm run dev
```
Para atualizar a documentacao com Swagger:

```bash
cd Back
npm run swagger
npm run dev
```
Para visualizar a documentacao no localhost:
`http://localhost:3000/docs`

API padrao: `http://localhost:3000`

## 2) Frontend

Entre na pasta:

```bash
cd Front
```

Instale dependencias:

```bash
npm install
```

Execute em desenvolvimento:

```bash
npm run dev
```

### Acesso administrativo

Crie o primeiro administrador diretamente na API (ou pelo Insomnia):

```http
POST http://localhost:3000/administradores
Content-Type: application/json

{
  "nome": "Administrador",
  "email": "admin@bidbits.com",
  "senha": "senha-segura-123"
}
```

Depois, abra `http://localhost:5173/admin`, entre com esse e-mail e senha e use o painel para cadastrar consoles, midias e leiloes. O backend valida o token de administrador e ignora qualquer `adminId` enviado pelo navegador.

## Rotas do backend

### Rotas ativas no servidor (`Back/src/server.ts`)

- `GET /` -> mensagem "API: Leilao de Games"
- `/marcas` -> modulo de marcas (rotas implementadas)
- `/consoles` -> modulo de consoles (rotas implementadas)
- `/administradores/login` -> login de administrador
- `/administradores` -> cadastro e consulta de administradores
- `/midias` -> cadastro e consulta de midias
- `/leiloes` -> cadastro e consulta de leiloes

### Rotas implementadas: Marcas (`Back/src/routes/marcas.ts`)

- `GET /marcas` -> lista todas as marcas
- `POST /marcas` -> cria marca
- `PUT /marcas/:id` -> atualiza marca
- `DELETE /marcas/:id` -> remove marca

Body esperado em criacao/edicao:

```json
{
  "nome": "Nintendo"
}
```

### Rotas implementadas: Consoles (`Back/src/routes/consoles.ts`)

- `GET /consoles` -> lista consoles (ignora soft delete)
- `GET /consoles/:id` -> detalha console
- `POST /consoles` -> cria console
- `PUT /consoles/:id` -> atualiza console
- `DELETE /consoles/:id?adminId=1` -> soft delete (registra admin)

Body esperado em criacao/edicao:

```json
{
  "nome": "Mega Drive",
  "marcaid": 1,
  "empresa": "Sega",
  "ano": 1988,
  "foto": "https://...",
  "video": "https://...",
  "descricao": "Console classico da Sega",
  "adminId": 1
}
```

Valores aceitos em `empresa`:

- `Nintendo`
- `Sony`
- `Microsoft`
- `Xbox`
- `Atari`
- `Sega`
- `Tectoy`

As rotas `POST /consoles`, `POST /midias` e `POST /leiloes` exigem `Authorization: Bearer <token-do-admin>`.

## Banco de dados (Prisma)

As tabelas foram definidas em `Back/prisma/schema.prisma`.

### `marcas`

- `id`
- `nome`
- Relacoes: `consoles`, `midias`

### `consoles`

- `id`
- `nome`
- `marcaid` (FK -> `marcas.id`)
- `empresa` (enum)
- `ano`
- `foto`
- `video`
- `descricao`
- `createdAt`, `updatedAt`
- Soft delete: `deletadoEm`, `deletadoPorId`
- `adminId` (FK -> `admins.id`, criador)

### `midias`

- `id`
- `nome`
- `descricao`
- `foto`
- `ano`
- `video`
- `tipo` (enum `TipoMidia`: `Fita`, `DVD`, `CD`)
- `marcaid` (FK -> `marcas.id`)
- `empresa` (enum)
- `createdAt`, `updatedAt`
- `adminId` (FK -> `admins.id`, criador)
- Soft delete: `deletadoEm`, `deletadoPorId`

### `leiloes`

- `id`
- `nome`
- `descricao`
- `valorInicial`
- `midiaId` (FK opcional -> `midias.id`)
- `consoleId` (FK opcional -> `consoles.id`)
- `dataInicio`, `dataFim`
- `createdAt`, `updatedAt`
- `adminId` (FK -> `admins.id`, criador)

### `lances`

- `id`
- `valor`
- `dataLance`
- `usuarioId` (FK -> `usuarios.id`)
- `leilaoId` (FK -> `leiloes.id`)

### `usuarios`

- `id`
- `nome`
- `email` (unico)
- `senha`

### `admins`

- `id`
- `nome`
- `email` (unico)
- `senha`
- Relacoes de auditoria/criacao com consoles, midias e leiloes

### Enums

- `TipoMidia`: `Fita`, `DVD`, `CD`
- `Empresa`: `Nintendo`, `Sony`, `Microsoft`, `Xbox`, `Atari`, `Sega`, `Tectoy`

## Status atual

- Backend com modulos de marcas e consoles ativos
- Schema Prisma completo para dominio de leiloes
- Frontend ainda em fase de adequacao visual/funcional ao tema de leiloes

## Proximos passos sugeridos

- Implementar rotas de `midias`, `leiloes`, `lances`, `administrador` e `cliente`
- Conectar frontend ao backend com consumo das rotas reais
- Ajustar nomes/componentes do frontend para o dominio retro-gamer
