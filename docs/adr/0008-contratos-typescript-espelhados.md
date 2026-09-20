# ADR-0008: Contratos TypeScript espelhados entre as aplicações

- Status: Aceito
- Data: 2026-09-19

## Contexto

Frontend e backend trocam grafos, estados de sala, perguntas e eventos, mas atualmente são dois projetos TypeScript com builds independentes.

## Decisao

Manter tipos equivalentes nos dois lados, com os DTOs do frontend espelhando as interfaces do backend. Os nomes dos eventos também ficam centralizados em constantes locais.

Um pacote compartilhado nao sera introduzido no MVP.

No frontend, os tipos de dominio ficam em `src/types`, os payloads de formulario sao inferidos dos schemas Zod e os nomes dos eventos ficam em `src/constants/config.ts`. A lista de eventos deve continuar equivalente ao objeto `EVENTS` do gateway do backend.

## Alternativas consideradas

- Pacote `shared` interno: reduziria duplicacao, mas exigiria configurar build, resolucao de paths e versionamento entre os dois projetos.
- Contratos sem tipos: aumentaria erros de digitação e incompatibilidades silenciosas.

## Consequencias

- O MVP preserva builds e deploys independentes.
- Qualquer mudanca de payload exige atualizar os dois lados na mesma alteracao.
- A duplicacao e um risco conhecido; um pacote compartilhado passa a ser candidato quando a superficie de contrato crescer.
- A validacao de entrada ocorre no cliente com Zod e React Hook Form, mas nao substitui a validacao e a autoridade do backend.
- Alteracoes no protocolo exigem revisar os tipos, schemas e constantes do frontend junto com as interfaces e eventos do backend.
