# SWAPI e Midia

## Resumo

A SWAPI fornece dados estruturados (people, films, planets etc.), mas nao fornece imagens prontas para uso de UI.

Por isso, o projeto implementa uma estrategia de midia com fallback em cadeia.

## Dados da SWAPI usados no projeto

- Base: `https://swapi.dev/api/`
- Recursos principais:
  - `people`
  - `films`
  - `planets`
- Paginacao tipica das listas:
  - `count`
  - `next`
  - `previous`
  - `results`

## Estrategia de imagens implementada

Arquivo: `src/app/core/services/swapi.service.ts`

### 1) Extracao de ID

`getResourceId(url)` extrai o ID numerico da URL do recurso SWAPI.

Exemplo:

- `https://swapi.dev/api/people/42/` -> `42`

### 2) Candidatos de imagem

`getImageCandidates(resource, source)` retorna uma lista ordenada de URLs:

1. `https://cdn.jsdelivr.net/gh/tbone849/star-wars-guide@master/build/assets/img/{resource}/{id}.jpg`
2. `https://raw.githubusercontent.com/tbone849/star-wars-guide/master/build/assets/img/{resource}/{id}.jpg`
3. `https://starwars-visualguide.com/assets/img/{resource}/{id}.jpg`

### 3) Tentativa progressiva no componente

Nas telas de personagens, filmes e planetas:

- ao erro de imagem (`img error`), a UI tenta a proxima URL;
- quando todas falham, entra placeholder visual local.

## Mapeamento por tipo

- Personagens: `imageUrls` + `imageUrl`
- Filmes: `posterUrls` + `posterUrl`
- Planetas: `imageUrls` + `imageUrl`

Os campos singulares (`imageUrl` / `posterUrl`) mantem compatibilidade com fluxo legado.

## Beneficios

- maior taxa de sucesso de carregamento de imagem;
- resiliencia contra falha de origem externa;
- UI consistente mesmo sem imagem disponivel.
