# StarWarsApp

Este é um projeto **Angular** que consome a [Star Wars API (SWAPI)](https://swapi.dev/) para listar personagens, filmes e planetas do universo de Star Wars.

## Tecnologias Utilizadas
- Angular 18+
- TypeScript
- Angular Router
- TailwindCSS
- SWAPI (Star Wars API)
- RxJS

## Estrutura do projeto
- core/: O módulo central da aplicação contém:
  - models/ → Define os modelos de dados para personagens, filmes e planetas.
  - services/ → Serviços responsáveis por chamadas à API e manipulação de dados.
- feautures/: Aqui estão os módulos específicos de funcionalidades, divididos por domínio da aplicação (personagens, filmes e planetas).
  - characters/
    - character-list/ → Exibe a lista de personagens.
    - character-details/ → Mostra os detalhes de um personagem selecionado.
    - character-filter/ → Permite filtrar personagens por gênero.
    - character-routing.module.ts → Define as rotas do módulo de personagens.
- shared/: O diretório shared/ contém componentes reutilizáveis, como:
  - page-header/ → Componente de cabeçalho para reutilização em várias páginas.

## Funcionalidades
- Listagem de personagens com filtro por gênero
  - Utilização do Intersection Observer API para carregar os dados dinamicamente à medida que o usuário rola a página.
  - Se o Intersection Observer não detectar interseção porque a tela já é grande o suficiente para exibir todos os itens de uma vez (ou seja, não há necessidade de scroll), é necessário verificar manualmente se o carregamento de novos personagens deve ser acionado.
- Exibição de detalhes dos personagens
  - Dentro dos detalhes é possível verificar quais filmes o personagem selecionado apareceu
- Listagem de filmes com recomendações
  - Disponibilidade de filtros por data de lançamento, ordem cronológica e por personagem (necessário escolher o personagem)
- Listagem de planetas
- Interface responsiva com **TailwindCSS**
- Todos os itens utilizam in-memory cache para fazer as requisições somente uma vez.

## Rotas do Aplicativo
| Rota            | Descrição |
|----------------|----------|
| `/characters`  | Lista de personagens com filtro por gênero |
| `/films`       | Lista de filmes + recomendações |
| `/planets`     | Lista de planetas com base na quantidade de residents |

## Instalação e Execução
1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/star-wars-explorer.git
cd star-wars-explorer
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm start
```

4. Acesse no navegador:
```bash
http://localhost:4200
```
