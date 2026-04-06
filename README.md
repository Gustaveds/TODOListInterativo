# Fullstack Todo List - Arquitetura de Microsserviços
Este projeto consiste em um sistema de gerenciamento de tarefas (Todo List) desenvolvido com uma arquitetura distribuída em microsserviços. O objetivo principal foi demonstrar a integração entre diferentes ecossistemas de programação, garantindo segurança, isolamento de dados e escalabilidade.

Projeto desenvolvido para a disciplina de Engenharia de Software.

### A Arquitetura do Sistema
O projeto é dividido em quatro partes principais que se comunicam via HTTP/JSON:

* Serviço 1 (Node.js + Prisma): Responsável pela API principal, autenticação JWT e gerenciamento das tarefas.

* Serviço 2 (PHP + Eloquent): Atua como Gerador de Logs, registrando ações e erros do sistema.

* Serviço 3 (Python + FastAPI + SQLAlchemy): Analisador de dados que fornece estatísticas em tempo real por usuário.

* Frontend (HTML/JS): Interface do usuário que consome as APIs de forma integrada.

### Segurança e Regras de Negócio
* Autenticação JWT: Proteção de rotas sensíveis para garantir que apenas usuários logados acessem o sistema.

* Segurança de Dados: Uso de hash (Bcrypt) para armazenamento seguro de senhas.

* Autorização: Isolamento completo de dados, onde cada usuário gerencia exclusivamente suas próprias tarefas.

* Auditoria: Registro automático de eventos importantes no serviço de Logs.

### Como Executar o Projeto
Para o funcionamento pleno, os três serviços de backend devem estar rodando simultaneamente em terminais separados:

1. Backend Node.js (Porta 3001)
Comando: node index.js dentro da pasta node_prisma.

2. Backend PHP (Porta 8002)
Comando: php -S localhost:8002 dentro da pasta php_eloquent.

3. Backend Python (Porta 8001)
Ativar o ambiente virtual (.\venv\Scripts\activate) e rodar: uvicorn main:app --reload --port 8001 dentro da pasta python_fastapi.

4. Frontend
Basta abrir o arquivo index.html na pasta ai_todolist_frontend diretamente no navegador.

### Requisitos Técnicos Atendidos
Uso de 3 linguagens diferentes (Node, PHP, Python).

Uso de ORM em todos os serviços (Prisma, Eloquent, SQLAlchemy).

Implementação completa de Autenticação e Autorização.

Comunicação inter-serviços via Fetch API.

Persistência de dados em SQLite e Zero uso de SQL Puro.
