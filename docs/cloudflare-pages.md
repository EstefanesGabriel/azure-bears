# Publicar a Azure Bears pela primeira vez

O site já está preparado para Cloudflare Pages e Pages Functions. Primeiro publique o site com o recebimento dos formulários desligado. Depois use a URL recebida para configurar Turnstile e Google Sheets.

## Alternativa quando o painel não mostra Pages: publicar pelo PowerShell

É possível criar o projeto Pages e publicar diretamente do computador com Wrangler. Esse caminho mantém a API dos formulários e dispensa localizar o botão Pages no painel.

**Escolha do fluxo:** este método cria um projeto Direct Upload. As atualizações serão publicadas pelo terminal; o push para o GitHub sozinho não dispara deploy. A integração Git nativa exigiria outro projeto Pages; também é possível automatizar o upload por CI posteriormente.

Abra o PowerShell e execute cada etapa somente depois que a anterior terminar com sucesso:

```powershell
Set-Location C:\Gabriel\azure-bears
npm.cmd install
npx.cmd wrangler login
```

O login abre o navegador. Entre na conta Cloudflare correta e autorize o Wrangler. Não é necessário copiar tokens para o código ou para o chat.

Depois, no mesmo terminal, crie o projeto Pages:

```powershell
npx.cmd wrangler pages project create azure-bears --production-branch main
```

Se houver escolha de conta, selecione a mesma usada no painel. Se informar que o projeto Pages já existe na conta, confira com `npx.cmd wrangler pages project list` antes de seguir. A tentativa anterior de Worker é um recurso separado.

Gere a versão atual do site:

```powershell
npm.cmd run build
```

Se o build concluir com sucesso, publique:

```powershell
npx.cmd wrangler pages deploy dist --project-name azure-bears --branch main
```

Execute na raiz do repositório, onde está a pasta `functions`, para incluir a API. O comando envia os arquivos locais compilados; não exige commit/push prévio. Mantenha as inscrições desativadas até concluir a configuração dos serviços.

Após o sucesso, consulte a URL de produção no projeto Pages ou em `npx.cmd wrangler pages project list`. Não use o endereço temporário de uma implantação no lugar do endereço estável de produção ao configurar `SITE_ORIGIN` e Turnstile.

Para atualizar futuramente, repita o build e, depois de concluído, o comando `wrangler pages deploy` acima.

Referência: [publicação direta com Wrangler e suporte a Functions](https://developers.cloudflare.com/pages/get-started/direct-upload/).

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

### Build passa, mas `npx wrangler deploy` falha

Se o log mostrar `Success: Build command completed`, seguido de `Executing user deploy command: npx wrangler deploy` e `Missing entry-point to Worker script or to assets directory`, o site foi compilado, mas a publicação está usando o fluxo de Workers. Este repositório está configurado para Pages, com `pages_build_output_dir` e a pasta `functions`.

Volte a **Workers & Pages → Create application** e escolha explicitamente **Pages → Connect to Git** (ou o link **Get started** associado a Pages). Crie o projeto Pages usando o mesmo repositório e os valores da seção 3. No fluxo Pages conectado ao Git, você informa o comando de build e a pasta de saída; não precisa preencher um comando `wrangler deploy`.

Não é necessário excluir a tentativa anterior para começar a configuração Pages. Não adicione um `main` fictício nem somente `assets.directory` ao `wrangler.jsonc` para contornar essa mensagem: isso não publica a API dos formulários como Pages Functions. Os avisos de scripts de instalação do npm não são a causa dessa falha quando o build já terminou com sucesso.

Referências oficiais: [publicação pelo Git](https://developers.cloudflare.com/pages/get-started/git-integration/) e [publicação das Pages Functions](https://developers.cloudflare.com/pages/functions/get-started/).
