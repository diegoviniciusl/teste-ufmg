# Sistema de Gestão de Processos

Este é um projeto de um sistema de gestão de processos para uma possível empresa da área legal. O sistema permite o controle e a execução de processos por meio de uma plataforma online. 

## Membros do Grupo
- Vinícius Correia
- Migues Scatolin
- Diego Vinícius
- Lucas Jacone
- Rafael Neves

## Descrição do Sistema
O sistema consiste em um conjunto de funcionalidades que permitem o gerenciamento eficiente de processos solicitados por empresas. Ele oferece uma interface intuitiva e amigável para que os usuários possam controlar todas as etapas do processo, desde o cadastro da empresa solicitante até o acompanhamento do status de cada processo.

### Funcionalidades Principais
O sistema é composto pelas seguintes funcionalidades principais:

1. CRUD de Usuários:
   - Cadastro de novos usuários com informações como nome, e-mail e senha.
   - Listagem de todos os usuários cadastrados.
   - Atualização das informações dos usuários.
   - Exclusão de usuários do sistema.

2. CRUD de Empresas:
   - Cadastro de novas empresas solicitantes com informações como nome, CNPJ e endereço.
   - Listagem de todas as empresas cadastradas.
   - Atualização das informações das empresas.
   - Exclusão de empresas do sistema.

3. CRUD de Processos:
   - Registro de novos processos contendo informações como número, descrição e empresa solicitante.
   - Listagem de todos os processos cadastrados, exibindo suas informações principais.
   - Visualização detalhada de cada processo, incluindo informações completas e histórico de atividades.
   - Alteração do status de cada processo, permitindo acompanhamento do progresso. Os status possíveis são:
     - PENDING (Pendente)
     - IN_PROGRESS (Em andamento)
     - TO_CHECK (Aguardando verificação)
     - IN_CONFERENCE (Em conferência)
     - CHECKED (Verificado)
     - SENT (Enviado)

### Tecnologias Utilizadas
O sistema foi desenvolvido utilizando as seguintes tecnologias:

- Front-end:
  - Framework: React.js
  - Gerenciador de Pacotes: npm

- Back-end:
  - Framework: Node.js
  - Banco de Dados: PostgreSQL
  - ORM: Prisma
  - Gerenciador de Pacotes: npm
  - Biblioteca de Testes: Jest

O uso do React.js no front-end proporciona uma experiência interativa e responsiva aos usuários, com componentes reutilizáveis e uma arquitetura de desenvolvimento moderna.

No back-end, o Node.js foi escolhido para oferecer uma base sólida e escalável para o sistema. O banco de dados PostgreSQL é utilizado para armazenar as informações dos usuários, empresas e processos, enquanto o Prisma é utilizado como um ORM (Object-Relational Mapping) para simplificar o acesso e manipulação dos dados.

A biblioteca de testes Jest é utilizada para garantir a qualidade do código e a robustez do sistema. Com o Jest, foram criados testes automatizados que verificam o correto funcionamento das funcionalidades, garantindo que as alterações e implementações no código não comprometam a integridade do sistema.

O gerenciador de pacotes npm é utilizado tanto no front-end quanto no back-end para gerenciar as dependências do projeto, facilitando a instalação e atualização dos pacotes necessários.

