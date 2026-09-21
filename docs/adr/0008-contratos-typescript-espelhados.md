# ADR-0008: Contratos TypeScript espelhados entre as aplicações

- Status: Aceito
- Data: 2026-09-19

## Contexto

Frontend e backend trocam grafos, estados de sala, perguntas e eventos, mas atualmente são dois projetos TypeScript com builds independentes.

## Decisão

Manter tipos equivalentes nos dois lados, com os DTOs do frontend espelhando as interfaces do backend. Os nomes dos eventos também ficam centralizados em constantes locais.

Um pacote compartilhado não será introduzido no MVP.

No frontend, os tipos de domínio ficam em `src/types`, os payloads de formulário são inferidos dos schemas Zod e os nomes dos eventos ficam em `src/constants/config.ts`. A lista de eventos deve continuar equivalente ao objeto `EVENTS` do gateway do backend.

## Alternativas consideradas

- Pacote `shared` interno: reduziria duplicação, mas exigiria configurar build, resolução de paths e versionamento entre os dois projetos.
- Contratos sem tipos: aumentaria erros de digitação e incompatibilidades silenciosas.

## Consequências

- O MVP preserva builds e deploys independentes.
- Qualquer mudanca de payload exige atualizar os dois lados na mesma alteração.
- A duplicação é um risco conhecido; um pacote compartilhado passa a ser candidato quando a superfície de contrato crescer.
- A validação de entrada ocorre no cliente com Zod e React Hook Form, mas não substitui a validação e a autoridade do backend.
- Alterações no protocolo exigem revisar os tipos, schemas e constantes do frontend junto com as interfaces e eventos do backend.
