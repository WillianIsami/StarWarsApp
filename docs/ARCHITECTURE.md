# Arquitetura

## Visao geral

A aplicacao usa Angular 18 com componentes standalone e roteamento lazy por dominio.

Fluxo principal:

1. `SwapiService` busca dados da SWAPI e aplica cache.
2. `RecommendationService` aplica regras de recomendacao/filtro de filmes.
3. Componentes de `feautures/*` tratam estado de tela, filtros e renderizacao.

## Modulos e responsabilidades

## Core

- `src/app/core/models/*`
  - contratos de `Character`, `Film` e `Planet`.
  - suporte a campos de imagem com fallback (`imageUrls` / `posterUrls`).
- `src/app/core/services/swapi.service.ts`
  - pagina todas as pessoas e planetas com `expand + reduce`;
  - normaliza URLs da SWAPI para `https`;
  - cache de payload final (`dataCache`);
  - deduplicacao de requests simultaneas (`requestCache + shareReplay(1)`);
  - cache de nome de recursos relacionados (`resourceNameCache`);
  - gera candidatos de imagem por recurso (`getImageCandidates`).
- `src/app/core/services/recommendation.service.ts`
  - ordenacao de filmes por lancamento ou cronologia;
  - filtro de filmes por personagem;
  - filtro local por titulo.

## Shared

- `src/app/shared/components/page-header`
  - navegacao principal;
  - destaque da rota ativa;
  - menu responsivo.

## Features

- `src/app/feautures/characters`
  - busca, filtro por genero, ordenacao;
  - infinite scroll por lotes;
  - modal de detalhes do personagem.
- `src/app/feautures/films`
  - filtros de maratona;
  - busca por titulo;
  - expansao de opening crawl.
- `src/app/feautures/planets`
  - busca e filtro por terreno;
  - ordenacoes e metricas agregadas.

## UI e estilos

- `src/styles.scss`: design tokens globais (cores, superficies, inputs, botoes e estados).
- SCSS por componente para layout e comportamento visual especifico.
- Tailwind CSS 3 ativo via PostCSS.

## Roteamento

Arquivo: `src/app/app.routes.ts`

- `/` -> redireciona para `/characters`
- `/characters`
- `/films`
- `/planets`

## Build e testes

- `angular.json` com budget de estilo por componente ajustado para o design atual:
  - warning: `4kB`
  - error: `8kB`
- testes unitarios via Karma + Jasmine.
- specs usam stubs onde necessario para evitar dependencia de rede.
