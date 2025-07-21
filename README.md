# Vitrine de Produtos

API RESTful para e-commerce, construída com TypeScript, NestJS e Prisma, com foco em fornecer endpoints, seguros e fáceis de consumir no frontend.

## Funcionalidades

✅ Autenticação de Usuário
- Cadastro, login de usuários e logout ***(/register, /login) e /logout***
- Autenticação via **JWT** armazenado em **cookie HTTP-Only**
- Proteção **CSRF** no middleware (previne uso malicioso de cookies HTTP-only em requisições forjadas)
- Proteção **CORS** no middleware (permite envio de cookies apenas de domínios confiáveis)

📦 Produtos
- Listagem paginada de produtos ***(/produtos)***
- Filtros opcionais por categoria, ordenação por preço, avaliação ou categoria
- Suporte a paginação via parâmetros page e limit
- Detalhamento de produto por id ***(/produtos/[id])***

🔐 Rotas Protegidas
- Informações do usuário logado ***(/user/me)***

## Tecnologias Utilizadas

- TypeScript
- NestJS
- Prisma ORM
- Jest (testes)
- ESLint & Prettier (linting e formatação)
- Docker & Docker Compose
- Swagger (documentação da API com @nestjs/swagger e swagger-ui-express)

## Pré-requisitos

- Node.js >=20.0.0 <23

## Requisitos

Para executar este projeto localmente, você precisará ter instalado:

- [Docker](https://www.docker.com/get-started/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Como Executar

### 1. Clone o repositório

```bash
git clone https://github.com/HigorR456/vitrine-produtos-backend.git
cd vitrine-produtos-backend
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário.

### 3. Inicie a aplicação com Docker Compose

```bash
docker compose up
```

A aplicação estará disponível em `http://localhost:4000` (ou na porta configurada no arquivo `.env`).

Para executar em segundo plano:

```bash
docker compose up -d
```

### 4. Parar a aplicação

```bash
docker compose down
```

## Documentação da API

A documentação da API foi gerada utilizando as bibliotecas **`@nestjs/swagger`** e **`swagger-ui-express`**, seguindo a especificação **OpenAPI 3.0.0**. Ela fornece uma interface interativa para explorar e testar os endpoints da aplicação.

### Acessando a Documentação

Após iniciar a aplicação, você pode acessar a documentação da API através da URL:
```bash
http://localhost:4000/api
```

A documentação informa todos os endpoints da API, com detalhes de parâmetros, respostas, e possíveis erros.


## Desenvolvimento

### Comandos úteis

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm dev

# Executar testes
npm test

# Verificar e corrigir problemas de linting
npm lint

# Gerar cliente Prisma
npx prisma generate

# Executar migrations
npx prisma migrate deploy

# Executar seeds
npx prisma db seed

# Executar migrations, gerar cliente Prisma, resetar banco e executar seeds
npx prisma migrate reset -f
```

## Licenciamento

ISC

---

Desenvolvido por [Higor Ruan](https://github.com/HigorR456)
