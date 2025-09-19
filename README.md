# PIB IBGE — Desafio Conectar

> Uma aplicação web em React para visualizar a evolução do PIB brasileiro (total e per capita) a partir da API do IBGE. O projeto apresenta os dados em um gráfico de linha interativo e em uma tabela responsiva.

## Demo

Confira a aplicação no ar: **[https://pib-ibge-desafio-conectar.vercel.app](https://pib-ibge-desafio-conectar.vercel.app)**

---

## 💻 Tecnologias e Funcionalidades

Este projeto foi construído com as seguintes tecnologias e oferece as seguintes funcionalidades:

- **React `^19.x`:** Biblioteca principal para a construção da interface.
- **Vite `^7.x`:** Bundler e servidor de desenvolvimento otimizado.
- **Chart.js `^4.x` + react-chartjs-2 `^5.x`:** Utilizados para gerar o gráfico de evolução do PIB.
- **React Router DOM `^7.x`:** Gerencia a navegação entre a página do gráfico e da tabela.
- **Context API:** Gerenciamento de estado global (`PibContext`) para o carregamento dos dados da API.
- **ESLint:** Ferramenta de análise estática para garantir a qualidade e padronização do código.
- **Vitest & React Testing Library:** Para testes unitários e de integração.
- **Responsividade:** Layout adaptável para dispositivos móveis e desktops.

### **Funcionalidades da Aplicação**

- **Gráfico de Evolução do PIB:** Exibe o PIB total e o PIB per capita em dólares americanos ao longo dos anos, permitindo uma visualização clara da tendência.
- **Tabela de Dados:** Apresenta os dados brutos de forma paginada e ordenada, com valores formatados para fácil leitura.
- **Carregamento e Erro:** Tratamento visual dos estados de carregamento e erro da API.

---

## 📂 Estrutura do Projeto

A arquitetura da aplicação segue o padrão de componentes reutilizáveis e separação de responsabilidades.

src/
├── components/           # Componentes reutilizáveis (Header, Footer, etc.)
│   ├── PibChart/         # Componente do gráfico de PIB
│   └── PibTable/         # Componente da tabela de PIB
├── context/              # Contexto de dados para o PIB (PibContext)
├── services/             # Lógica para consumo de APIs (IBGE, cotação de moedas)
│   └── tests/        # Testes de unidade para os serviços
├── App.jsx               # Componente principal
├── index.css             # Estilos globais
├── main.jsx              # Ponto de entrada da aplicação
└── setupTests.js         # Configuração do ambiente de testes


---

## 🚀 Como Executar o Projeto

### **Pré-requisitos**

Certifique-se de ter o [Node.js](https://nodejs.org/) (versão 18+) e o [npm](https://www.npmjs.com/) (versão 9+) instalados.

### **Instalação e Execução**

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/Kevinlps/pib-ibge-desafio-conectar.git](https://github.com/Kevinlps/pib-ibge-desafio-conectar.git)
    cd pib-ibge-desafio-conectar
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará acessível em `http://localhost:5173`.

---

## ✅ Testes

Para rodar os testes unitários com Vitest, use o comando:

```bash
npm run test