# ADR-0015: Estado de sessão e localização do frontend

- Status: Aceito
- Data: 2026-09-20

## Contexto

O frontend precisa preservar a sala durante a navegação, reconstruir a tela a partir dos eventos do servidor e atender jogadores em português e inglês. O MVP não precisa de persistência de conta nem de uma biblioteca externa de internacionalização.

## Decisão

Manter no `localStorage` apenas a sessão mínima da sala: código, nome do jogador e papel. O estado recebido durante a entrada ou a reconexão é mantido temporariamente até ser consumido pela página da sala.

Usar um catálogo local tipado com os idiomas `pt` e `en`, exposto por `I18nProvider` e `useI18n`. As perguntas usam uma tabela tipada que relaciona cada `QuestionType` a uma chave de tradução.

Não persistir estado de partida no navegador. Após a montagem da sala, o frontend deve reconstruir a partida a partir dos eventos e do estado enviados pelo servidor.

## Alternativas consideradas

- Persistir toda a partida no `localStorage`: poderia exibir estado obsoleto e duplicaria a autoridade do servidor.
- Usar uma biblioteca completa de i18n: adicionaria configuração e dependências desnecessárias para dois idiomas e um catálogo pequeno.
- Exigir uma conta para recuperar a sala: aumentaria o escopo do MVP sem melhorar o fluxo atual de convite por código.

## Consequências

- A página da sala pode ser recarregada ou acessada diretamente enquanto a sessão local continuar disponível.
- O servidor continua sendo a fonte de verdade para sala, turno, candidatos e resultado.
- Adicionar um idioma exige completar o catálogo e manter as chaves de tradução compatíveis.
- O `localStorage` deve ser tratado como entrada não confiável e não deve conter propriedades privadas dos grafos.