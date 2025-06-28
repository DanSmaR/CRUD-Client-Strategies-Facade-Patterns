# Cliente CRUD - Aplicação Node.js com TypeScript

Este projeto implementa um CRUD de Cliente utilizando Node.js, Express, TypeScript, templates EJS e CSS, aplicando os padrões de design Facade, Strategy e DAO Repository, conforme solicitado.

## Padrões de Design Implementados

1. **Facade Pattern**: Implementado no controller para simplificar a interface entre as rotas HTTP e a lógica de negócio.
2. **Strategy Pattern**: Utilizado para validação de dados do cliente, permitindo diferentes estratégias de validação.
3. **DAO Repository Pattern**: Implementado para abstrair o acesso a dados e operações de persistência.

## Estrutura do Projeto

```
/client-crud-app
├── /src
│   ├── /controllers          # Controllers com padrão Facade
│   ├── /domain               # Entidades de domínio
│   │   ├── /interfaces       # Interfaces de domínio
│   │   └── /entities         # Classes de entidades
│   ├── /repositories         # Implementação do padrão DAO Repository
│   │   ├── /interfaces       # Interfaces dos repositórios
│   │   └── /implementations  # Implementações concretas
│   ├── /strategies           # Implementação do padrão Strategy para validação
│   │   ├── /interfaces       # Interface da estratégia
│   │   └── /implementations  # Implementações concretas de validação
│   ├── /views                # Templates EJS
│   │   ├── /layouts          # Layouts compartilhados
│   │   ├── /clients          # Views específicas de cliente
│   │   └── /partials         # Componentes parciais reutilizáveis
│   ├── /public               # Arquivos estáticos (CSS, JS, imagens)
│   │   └── /css              # Estilos CSS
│   ├── app.ts                # Configuração do Express
│   └── server.ts             # Ponto de entrada da aplicação
├── package.json
├── tsconfig.json
└── README.md
```

## Requisitos

- Node.js (v14 ou superior)
- npm ou yarn

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Compile o TypeScript:

```bash
npm run build
```

4. Inicie o servidor:

```bash
npm start
```

Para desenvolvimento, você pode usar:

```bash
npm run dev
```

## Funcionalidades

- Listagem de clientes
- Cadastro de novos clientes
- Visualização detalhada de cliente
- Edição de cliente
- Exclusão de cliente
- Gerenciamento de dependentes

## Tecnologias Utilizadas

- Node.js
- Express
- TypeScript
- EJS (templates)
- SQLite (banco de dados)
- CSS

## Princípios de OOP Aplicados

- **Encapsulamento**: Atributos privados e métodos públicos nas classes
- **Herança**: Hierarquia de classes (DomainEntity -> Person -> Client)
- **Polimorfismo**: Interfaces e implementações variadas (IStrategy, IRepository)
- **Abstração**: Classes abstratas e interfaces definindo contratos

## Autor

Desenvolvido como parte do projeto de Engenharia de Software III.
