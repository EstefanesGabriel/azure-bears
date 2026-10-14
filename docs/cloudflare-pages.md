# Publicar a Azure Bears pela primeira vez

O site já está preparado para Cloudflare Pages e Pages Functions. Primeiro publique o site com o recebimento dos formulários desligado. Depois use a URL recebida para configurar Turnstile e Google Sheets.

## 1. Enviar a versão atual para o GitHub

O repositório configurado neste projeto é `EstefanesGabriel/azure-bears`, e a branch local é `main`.

No GitHub Desktop ou no controle de versão do seu editor, revise as alterações, faça o commit e envie com **Push** para `main`. A Cloudflare usa o código enviado ao GitHub, não os arquivos que ainda estão apenas no seu computador. Inclua a configuração `wrangler.jsonc`, a pasta `functions` e os demais arquivos da implementação.

Não inclua `.dev.vars`, `.env`, credenciais, `node_modules` ou `dist`; esses caminhos já estão ignorados pelo Git. Não é necessário tornar o repositório público.

## 2. Criar o projeto Pages

1. Entre em [dash.cloudflare.com](https://dash.cloudflare.com/) e selecione sua conta.
2. Abra **Workers & Pages → Create application → Pages → Connect to Git**. Dependendo da apresentação do painel, a entrada de Pages pode aparecer como **Get started** junto de “Deploy a Pages site”.
3. Conecte o GitHub e autorize acesso ao repositório `azure-bears`.
4. Selecione o repositório e inicie a configuração.

Se aparecer um formulário pedindo um domínio existente ou servidores DNS, você entrou na área de domínios. Volte para Workers & Pages. Se aparecer um campo obrigatório de comando de deploy do Worker, volte à opção Pages.

## 3. Configuração da primeira publicação

| Campo | Valor |
| --- | --- |
| Project name | `azure-bears`, se disponível |
| Production branch | `main` |
| Framework preset | `None` (configure os campos abaixo manualmente) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Deixar vazio, usando a raiz do repositório |
| Variável `NODE_VERSION` | `24` |
| Variável `SUBMISSIONS_ENABLED` | `false` |

O campo `name` de `wrangler.jsonc` está configurado como `azure-bears`. Se escolher outro nome de projeto, ajuste esse campo e envie a alteração ao GitHub antes de publicar.

Mantenha os valores `enabled: false` em `src/data/submissions.ts`. Nesta primeira publicação, não é necessário configurar chaves do Turnstile nem do Apps Script.

Selecione **Save and Deploy**. Acompanhe o log até a conclusão. O projeto instala as dependências, gera o site e publica a função de `/api/forms`.

Use a integração Git para esta configuração. O upload manual por arrastar arquivos no painel não publica a pasta `functions`, necessária para os formulários.

## 4. Abrir o site e obter a URL

Após o deploy, abra o endereço de produção mostrado no projeto. Ele terá o formato `https://NOME-ATRIBUIDO.pages.dev`. O nome exato depende do endereço atribuído pela Cloudflare; não suponha que `azure-bears.pages.dev` esteja disponível.

Confira a Home, `/sobre` e `/seletivas`, inclusive recarregando essas páginas diretamente. O site deve abrir normalmente, e o envio dos formulários deve continuar indisponível até a ativação.

Exemplo, caso a URL recebida seja `https://seu-projeto.pages.dev`:

| Configuração posterior | Valor |
| --- | --- |
| Hostname do widget Turnstile | `seu-projeto.pages.dev` |
| `SITE_ORIGIN` no Pages | `https://seu-projeto.pages.dev` |

Continue no [guia Google Sheets](google-sheets.md) para criar o widget, configurar as credenciais, testar as gravações e abrir as inscrições. Até lá, deixe `SUBMISSIONS_ENABLED=false`.

## 5. Atualizações futuras

Com a integração Git configurada, novos pushes para a branch de produção disparam novas publicações. Para conferir uma publicação, veja o status, o commit e a URL em Workers & Pages → seu projeto.

Se a publicação falhar, abra o log do deploy e procure o primeiro erro. Confira se os arquivos atuais chegaram ao GitHub, se o comando é `npm run build`, se a saída é `dist` e se `NODE_VERSION=24` foi aplicada.

Referências oficiais: [publicação pelo Git](https://developers.cloudflare.com/pages/get-started/git-integration/) e [publicação das Pages Functions](https://developers.cloudflare.com/pages/functions/get-started/).
