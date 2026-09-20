# ADR-0008: Contratos TypeScript espelhados entre as aplicacoes

- Status: Aceito
- Data: 2026-09-19

## Contexto

Frontend e backend trocam grafos, estados de sala, perguntas e eventos, mas atualmente sao dois projetos TypeScript com builds independentes.

## Decisao

Manter tipos equivalentes nos dois lados, com os DTOs do frontend espelhando as interfaces do backend. Os nomes dos eventos tambem ficam centralizados em constantes locais.

Um pacote compartilhado nao sera introduzido no MVP.

## Alternativas consideradas

- Pacote `shared` interno: reduziria duplicacao, mas exigiria configurar build, resolucao de paths e versionamento entre os dois projetos.
- Contratos sem tipos: aumentaria erros de digitacao e incompatibilidades silenciosas.

## Consequencias

- O MVP preserva builds e deploys independentes.
- Qualquer mudanca de payload exige atualizar os dois lados na mesma alteracao.
- A duplicacao e um risco conhecido; um pacote compartilhado passa a ser candidato quando a superficie de contrato crescer.
