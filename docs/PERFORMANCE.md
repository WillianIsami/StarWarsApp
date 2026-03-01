# Performance

## Resumo

O projeto aplica estrategias de cache, deduplicacao de requests e renderizacao incremental para manter resposta rapida da UI, mesmo consumindo dados paginados da SWAPI.

## Melhorias implementadas

## 1) Cache de payload final

`SwapiService` usa `dataCache` (`Map<string, unknown>`) para armazenar respostas finais por chave logica (`allCharacters`, `allPlanets`, `films`, etc.).

Impacto:

- evita repetir requests ao navegar entre rotas;
- acelera interacoes apos primeira carga.

## 2) Deduplicacao de requests em voo

`requestCache` + `shareReplay(1)` evitam chamadas duplicadas quando varios consumidores solicitam o mesmo recurso ao mesmo tempo.

Impacto:

- menor volume de rede;
- menor risco de estado inconsistente em concorrencia.

## 3) Cache de recursos relacionados

`resourceNameCache` e `resourceNameRequestCache` evitam repetir resolucao de nomes para URLs relacionadas (filmes, especies, veiculos, naves, homeworld).

Impacto:

- modal de personagem mais rapido;
- menos round-trips para a SWAPI.

## 4) Carregamento incremental de personagens

A lista de personagens renderiza em lotes e usa `IntersectionObserver` para carregar gradualmente.

Impacto:

- menor custo de render inicial;
- scroll mais fluido em listas maiores.

## 5) Filtros e ordenacao locais

Depois da carga inicial de cada dominio, filtros e ordenacao sao feitos em memoria.

Impacto:

- resposta imediata para o usuario;
- sem nova request para cada ajuste de filtro.

## 6) Midia com fallback progressivo

Imagens usam cadeia de URLs e avancam automaticamente quando uma origem falha.

Impacto:

- menos cards sem imagem;
- menos necessidade de reload manual da pagina.

## 7) Lazy loading de imagens

Cards usam `loading="lazy"`.

Impacto:

- menor banda no first paint;
- melhor tempo percebido de carregamento.

## Evolucoes recomendadas

- virtualizacao de lista (`cdk-virtual-scroll-viewport`) para volumes maiores;
- persistencia de cache opcional em `sessionStorage`;
- prefetch de rotas com base em comportamento de navegacao;
- monitoramento de taxa de falha por origem de imagem.
