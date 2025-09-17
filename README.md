# PIB IBGE — Desafio Conectar

> Aplicação frontend em React que consome a API de agregados do IBGE para exibir a evolução do PIB brasileiro (total e per capita) em gráfico e tabela responsiva.

---

## Sobre

Este repositório implementa uma interface em React que consome a API pública do IBGE (Agregados) para apresentar:

- **Tela 1 — Gráfico**: evolução do PIB total (US\$) e PIB per capita (US\$) ao longo dos anos (gráfico de linha responsivo usando Chart.js + react-chartjs-2).
- **Tela 2 — Tabela**: listagem por ano com PIB total e PIB per capita (formatado em moeda), ordenada do mais antigo ao mais recente, com paginação/scroll quando necessário.

O layout foi pensado para ser responsivo e acessível, com componentes reusáveis e tratamento de estados (loading / erro).

---

## Demo

> Link do deploy: **(Em breve)**

---

## Tecnologias

- React `^19.x`
- Vite `^7.x` (bundler / dev server)
- Chart.js `^4.x` + react-chartjs-2 `^5.x` (gráficos)
- react-router-dom `^7.x` (navegação entre telas)
- ESLint (qualidade de código)

Dependências listadas no `package.json` do repositório.

---

## Pré-requisitos

- Node.js 18+ (recomendo Node 18 ou 20)
- npm 9+ ou yarn

---

## Instalação e execução

1. Clone o repositório:

```bash
git clone https://github.com/Kevinlps/pib-ibge-desafio-conectar.git
cd pib-ibge-desafio-conectar
```

2. Instale as dependências:

```bash
npm install
# ou
# yarn
```

3. Rode em modo de desenvolvimento:

```bash
npm run dev
# abre em http://localhost:5173 por padrão (Vite)
```

4. Build para produção:

```bash
npm run build
npm run preview
```

---

## Scripts úteis

- `npm run dev` — inicia o servidor de desenvolvimento (Vite)
- `npm run build` — cria build de produção
- `npm run preview` — visualiza o build localmente
- `npm run lint` — executa ESLint

> Observação: se você adicionar um runner de testes (Jest / Vitest), inclua o script `test`.

---

## Como a aplicação consome a API do IBGE

A aplicação consome a API pública do IBGE (Agregados) para obter variáveis históricas do PIB. Exemplo de endpoint base (documentação oficial):

```
https://servicodados.ibge.gov.br/api/v3/agregados/{agregado}/variaveis/{variavel}
```

No projeto utiliza-se um `PibContext` (Context API) que faz o fetch dos dados, normaliza os valores (transforma strings para `number` quando necessário) e expõe arrays:

- `labels` — array de anos (strings)
- `pibTotal` — array de valores numéricos do PIB total (US\$)
- `pibPerCapita` — array de valores numéricos do PIB per capita (US\$)
- `isLoading`, `isError` — estados do fetch

## Estrutura do projeto

```
src/
├─ components/
│  ├─ Chart/ (PibChart)
│  ├─ Table/ (PibTable)
├─ context/
│  └─ PibContext.tsx
├─ pages/
│  ├─ ChartPage.tsx
│  └─ TablePage.tsx
├─ routes/
├─ styles/
│  └─ app.css
└─ main.tsx
```

---

## Como o projeto atende ao teste

- **Gráfico de evolução do PIB**: implementado com Chart.js + react-chartjs-2. Eixo X: anos; Eixo Y: valores em dólares; duas linhas com cores distintas e legenda.
- **Tabela de PIB por ano**: exibe colunas Ano, PIB total e PIB per capita; ordenada do mais antigo ao mais recente; valores formatados com `Intl.NumberFormat` para moeda; tabela responsiva com scroll horizontal/pagination.
- **Responsividade**: layout adaptativo com breakpoints para 768px e 480px.
- **Gerenciamento de estado**: Context API (`PibContext`) para centralizar fetch e normalização de dados.
- **Qualidade do Código**: ESLint configurado (veja `npm run lint`). Componentização aplicada para separar responsabilidades.

---

## Testes

O repositório já inclui dependências de teste do `@testing-library/react`. Caso ainda não haja testes, siga estas instruções rápidas para adicionar um teste com `Vitest` ou `Jest`:

**Opção (Vitest + Testing Library)**

1. Instale:

```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom
```

2. Adicione script no `package.json`:

```json
"test": "vitest"
```

3. Exemplo de teste simples para `PibTable` (src/components/Table/PibTable.test.tsx):

```tsx
import { render, screen } from '@testing-library/react';
import PibTable from './PibTable';

test('mostra mensagem de carregamento quando isLoading', () => {
  // mock do contexto para retornar isLoading=true
});
```

Rodar teste:

```bash
npm run test
```

> Recomendo escrever testes para:
>
> - Componente `PibContext` (mock fetch) — garante normalização dos dados.
> - Componente `PibTable` — valida renderização de linhas e paginação.
> - Componente `PibChart` — valida presença do canvas/elemento de gráfico e datasets.

---

## Deploy

em breve


