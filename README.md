# ProdControl

ℹ️ **Sobre o Projeto**

Bem-vindo ao repositório do ProdControl uma solução ideal para organizar e controlar o seu estoque de forma descomplicada. Cadastre produtos com facilidade, acompanhe entradas e saídas e tenha uma visão clara do seu inventário. Perfeito para pequenos e médios negócios que buscam eficiência sem complicação.

🛠️ **Tecnologias Utilizadas**

* **Prisma**
* **React**
* **Vite**
* **TypeScript**
* **ESLint**

📚 **Configurações e Instalação**

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/FabricioLourenco/ProdControl.git
    cd ProdControl
    ```

## 🚀 Próximos Passos (Executando o Aplicativo)

Para colocar o aplicativo ProdControl em funcionamento, você precisará iniciar tanto o servidor (backend) quanto o cliente (frontend). Siga as instruções abaixo:

### 1. Configuração e Inicialização do Servidor (Backend)

1.  **Navegue até o diretório do servidor**:
    ```bash
    cd server
    ```
2.  **Crie o arquivo de ambiente `.env`**:
    Este arquivo conterá a string de conexão com o banco de dados. Crie um arquivo chamado `.env` na raiz do diretório `server` com o seguinte conteúdo:
    ```
    DATABASE_URL="file:./dev.db"
    ```
    Este `DATABASE_URL` configura o Prisma para usar um banco de dados SQLite local chamado `dev.db`.
3.  **Instale as dependências do servidor**:
    ```bash
    npm install
    ```
4.  **Gere o cliente Prisma e execute as migrações do banco de dados**:
    Estes comandos configurarão seu banco de dados e gerarão o código necessário para o Prisma interagir com ele.
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```
5.  **Inicie o servidor em modo de desenvolvimento**:
    ```bash
    npm run dev
    ```
    O servidor será iniciado, geralmente na porta 3000 (ou outra porta configurada no `app.ts` do servidor).

### 2. Configuração e Inicialização do Cliente (Frontend)

1.  **Abra uma *nova* janela de terminal**.
2.  **Navegue até o diretório do cliente**:
    ```bash
    cd client
    ```
3.  **Instale as dependências do cliente**:
    ```bash
    npm install
    ```
4.  **Inicie o servidor de desenvolvimento do cliente**:
    ```bash
    npm run dev
    ```
    O aplicativo cliente será iniciado e aberto em seu navegador padrão, normalmente em `http://localhost:5173/`.

Uma vez que tanto o cliente quanto o servidor estejam em execução, você pode acessar a aplicação ProdControl no seu navegador.
