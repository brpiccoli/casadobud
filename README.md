# casadobud

Web app da comissão técnica: chat com o Bud e gráficos montados a partir dos dados do app dos atletas (budmobile). Usa o mesmo design system e o mesmo Supabase do budmobile.

## Stack

Vite 8 · React 19 · TypeScript 6 · React Router 8 · TanStack Query 5 · Supabase · Tailwind CSS 4 · shadcn/ui (Radix) · Recharts 3 · react-hook-form + zod · date-fns · lucide-react · sonner · Vitest · oxlint · Prettier

## Rodando

```bash
nvm use            # Node 22, igual ao budmobile
npm install
cp .env.example .env.local   # preencha com a URL e a publishable key do Supabase
npm run dev
```

O login usa as contas do Supabase do app. Só entram os emails listados em `VITE_ALLOWED_EMAILS` (separados por vírgula; vazio libera qualquer conta). É uma trava apenas no front, provisória até existir o cadastro de staff no banco.

| Script              | O que faz                                              |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Servidor de desenvolvimento em `http://localhost:5173` |
| `npm run build`     | Typecheck + build de produção                          |
| `npm run typecheck` | Só o TypeScript                                        |
| `npm run lint`      | oxlint em `src`                                        |
| `npm run format`    | Prettier (ordena as classes Tailwind)                  |
| `npm test`          | Vitest                                                 |

## Estrutura

```text
src/
├── components/        # UI compartilhada (auth, brand, chat, charts, layout)
│   └── ui/            # componentes shadcn (código gerado, editável)
├── config/            # env validado com zod
├── constants/         # rotas, escalas (styles.ts), motion, textos fixos
├── contexts/          # AuthContext, ThemeContext
├── features/<nome>/   # types, constants, service, utils, mocks e testes por domínio
├── hooks/             # hooks de dados (TanStack Query) e de sessão
├── integrations/supabase/  # client e types gerados (copiados do budmobile)
├── lib/               # queryClient, queryKeys, cn
├── navigation/        # router e guardas de rota
├── pages/             # telas, cada uma com seu .styles.ts
├── providers/         # AppQueryProvider
├── types/             # tipos compartilhados
└── utils/             # helpers puros
```

## Convenções (herdadas do budmobile)

- Alias `@/` para `src/`.
- Componente em `.tsx`, classes em `.styles.ts` (objetos de strings ou `cva` para variantes) e props em `.types.ts`.
- Dados via `services`/`features/*/*.service.ts` + hooks do TanStack Query com chaves em `lib/queryKeys.ts`.
- Tokens de cor em `src/index.css` espelham `global.css` e `lib/colors.ts` do budmobile (escuro `#1D1916`, claro `#F7F1ED`, mint, peach, pill, label-muted). Fontes: Fraunces (títulos) e Instrument Sans (interface).
- Tema segue a preferência do perfil (`profiles.dark_mode`), como no app.

## O que ainda é mock

- Conversas do staff (`features/conversations/conversations.service.ts`) e gráficos do dashboard (`features/charts/charts.service.ts`) — dependem das novas tabelas e da agregação dos check-ins no Supabase. O layout do dashboard persiste por usuário no localStorage até existir a tabela.
- Envio de mensagem, anexos, ditado e voz mostram "Em breve".
