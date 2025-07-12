# Teste Tecnico - Desenvolvedor(a) Fullstack Senior

# Objetivo

Construir uma aplicação fullstack simples e funcional utilizando Next.js (sem TypeScript) no frontend e
Node.js com Express no backend, com foco em boas práticas, integração com APIs REST e arquitetura
organizada.

# Instruções Gerais

- Utilize apenas JavaScript (ES6+)
- Frontend com Next.js sem TypeScript
- Backend com Node.js + Express
- O projeto deve ser publicado em um repositório público no GitHub
- Documente no README:
 - Como rodar o projeto localmente
 - Principais decisões técnicas

# Desafio Técnico

Você deve criar uma aplicação com 2 camadas (frontend e backend) que simula uma vitrine de produtos.

Frontend - Next.js
- Página inicial (/): consumir uma rota do backend que retorna produtos fictícios
- Página de detalhes (/produto/[id]): exibe detalhes de um produto
- Responsividade e boa usabilidade
- Utilizar next/head para título/meta tags
- Utilizar SSR ou SSG em pelo menos uma das rotas

Backend - NestJS
- Rota GET /produtos: retorna uma lista de produtos mockados (em memória)
- Rota GET /produtos/:id: retorna os detalhes de um produto específico
- Implementar boas práticas de organização de código (routes, controllers, services)

# Extras (Diferenciais) - Opcionais
- Usar Docker para facilitar execução local (Dockerfile e docker-compose.yml)
- Implementar algum tipo de autenticação (ex: login fake com sessão)
- Adicionar testes com Jest (pelo menos no backend)
- Implementar um pipeline básico de CI/CD (ex: GitHub Actions)
- Conectar com um banco de dados (ex: PostgreSQL local ou MongoDB Atlas)

# Critérios de Avaliação
- Clareza, organização e modularidade do código
- Aderência ao stack solicitado
- Boas práticas (segurança, validação, semântica)
- Entendimento de SSR ou SSG
- README completo e objetivo