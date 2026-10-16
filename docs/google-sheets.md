# Ativação dos formulários — Google Sheets

O código está preparado, mas o recebimento vem **desligado**. Não há credenciais reais no repositório. Somente ative depois de concluir os passos abaixo e enviar respostas fictícias de teste.

**Ainda não criou o site na Cloudflare?** Comece pelo [passo a passo da primeira publicação no Pages](cloudflare-pages.md). Ele explica como conectar o GitHub, publicar e obter a URL antes de configurar o Turnstile.

Fluxo: formulário React → `/api/forms` (Cloudflare Pages Function) → Apps Script com assinatura HMAC → planilha privada. Não é preciso cadastrar visitantes, publicar as planilhas nem administrar um servidor. A autorização do Google pertence à conta que publica o Apps Script.

## 1. Criar as planilhas privadas

Use uma conta Google administrada pela organização, com continuidade de acesso para futuras gestões. Ter um endereço de e-mail institucional não significa, por si só, que ele tenha uma conta Google ou permissão para publicar Apps Script.

Crie dois arquivos no Google Sheets:

- **Azure Bears — Seletivas**: manter este arquivo entre as edições.
- **Azure Bears — Loja**: separado para permitir compartilhar com os responsáveis pelos produtos.

No compartilhamento, mantenha **Acesso geral: Restrito**. Adicione individualmente apenas os responsáveis autorizados. Não use “Publicar na Web”. Abas ocultas/protegidas não restringem a leitura a pessoas que já têm acesso ao arquivo.

Copie os IDs das duas URLs: em `https://docs.google.com/spreadsheets/d/ID/edit`, copie somente `ID`. A conta que executará o script precisa poder editar os dois arquivos. Os responsáveis pela loja não precisam receber acesso às seletivas.

## 2. Preparar o Apps Script

1. Abra [script.google.com](https://script.google.com/) com a conta responsável e crie um projeto independente chamado **Azure Bears — Formulários**.
2. Copie o conteúdo de `integrations/google-apps-script/Code.gs` para `Code.gs` no editor.
3. Crie um arquivo de script chamado `Columns` e copie `integrations/google-apps-script/Columns.gs`.
4. Nas configurações do projeto, habilite a exibição do manifesto `appsscript.json`. Substitua seu conteúdo pelo arquivo do mesmo nome neste repositório. Ele ativa o serviço avançado **Google Sheets API v4**. Também é possível conferir em **Serviços → Google Sheets API**. Se usar um projeto Google Cloud padrão próprio, habilite a Sheets API nesse projeto.
5. Em **Configurações do projeto → Propriedades do script**, cadastre:

| Propriedade | Valor |
| --- | --- |
| `RECRUITMENT_SPREADSHEET_ID` | ID da planilha de seletivas |
| `STORE_SPREADSHEET_ID` | ID da planilha da loja |
| `APPS_SCRIPT_SECRET` | Segredo aleatório, igual ao que será cadastrado na Cloudflare |

Para gerar um segredo localmente, execute no seu terminal:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Guarde-o em um gerenciador de senhas. Não cole no chat, em arquivos versionados ou no código React. Nunca use prefixo `VITE_` para esse segredo.

6. No seletor de funções do editor, execute **`setupSheets`** e autorize o acesso às planilhas pela sua conta. No arquivo de seletivas, cria as abas `VALORANT`, `CS2`, `League of Legends`, `Brawl Stars`, `EA FC`, `Free Fire` e `Diretoria`. No arquivo da loja, cria `Solicitacoes`. Pode ser executada novamente sem apagar registros; falha se os cabeçalhos existentes forem incompatíveis.
7. Vá a **Implantar → Nova implantação → Aplicativo da Web**. Escolha **Executar como: Eu** e **Quem pode acessar: Qualquer pessoa**, incluindo pessoas sem login. Implante e copie a URL terminada em `/exec`, nunca `/dev`.

O endpoint pode receber chamadas públicas, mas só grava requisições assinadas pela função Cloudflare. Ele não permite consultar respostas. A planilha continua restrita. A URL não substitui o segredo. Mesmo chamadas rejeitadas podem consumir cotas do Apps Script.

Se a opção de acesso anônimo não existir, o domínio Google Workspace pode restringir a publicação. Solicite a configuração ao administrador; não torne as planilhas públicas para contornar isso. Nesse caso, mantenha o envio desligado até resolver ou adaptar para a API do Sheets.

**Após editar o script:** salve, abra **Implantar → Gerenciar implantações → Editar → Nova versão → Implantar**. Só salvar no editor não atualiza a versão de `/exec`. Atualize `Code.gs` e `Columns.gs` juntos.

**Se já usava a versão com a aba Competitivo:** substitua os dois scripts, execute `setupSheets` e publique uma nova versão da implantação existente. As novas inscrições vão para a aba do jogo escolhido. A antiga aba `Competitivo` e suas respostas permanecem intactas; não há migração automática do histórico. Uma tentativa de confirmação de um protocolo antigo é reconhecida sem gerar outra linha. Não exclua essa aba enquanto houver confirmações pendentes.

Cada modalidade guarda todas as edições no mesmo lugar, identificadas pelas colunas `Edição` e `Processo`. Player, Coach, Analista e Manager vão para a aba da modalidade escolhida, com a função registrada na coluna `Função`. Os cabeçalhos são comuns às abas competitivas; campos que não se aplicam ficam vazios. TFT, Wild Rift e Rocket League continuam ocultos e não recebem abas até serem ativados na configuração e o script ser atualizado.

## 3. Criar o Turnstile

### Ainda não tenho domínio: qual hostname usar?

Você não precisa comprar um domínio. O Cloudflare Pages fornece um endereço gratuito terminado em `pages.dev` após a primeira publicação.

1. Abra **Workers & Pages**, crie um projeto **Pages** conectado ao repositório e use as configurações de build da seção 4. Não é necessário adicionar um domínio à área de DNS.
2. Faça a primeira publicação mantendo os formulários desligados (`enabled: false` no código e `SUBMISSIONS_ENABLED` ausente ou `false`). O site pode ser publicado antes de configurar o Turnstile.
3. Copie o endereço de produção mostrado no projeto. Use esse endereço real nos campos abaixo.

Exemplo ilustrativo, se o endereço recebido fosse `https://seu-projeto.pages.dev`:

| Local | Valor |
| --- | --- |
| Hostnames do Turnstile | `seu-projeto.pages.dev` |
| Variável `SITE_ORIGIN` no Pages | `https://seu-projeto.pages.dev` |

O **Hostname** não leva `https://`, porta, caminho ou barra final. Não cadastre apenas `pages.dev` nem use um endereço de preview no lugar do endereço de produção. `seu-projeto` é um exemplo: substitua pelo endereço que o painel atribuir ao seu projeto.

Para testar exclusivamente no computador, use um widget separado com hostname `localhost` e configure `SITE_ORIGIN=http://localhost:8788` em `.dev.vars`. A seção 6 explica como executar a API localmente.

Referências: [endereço gerado pelo Pages](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/) e [formato dos hostnames no Turnstile](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/).

No painel Cloudflare, abra **Turnstile → Adicionar widget**:

- Nome: Azure Bears — Formulários.
- Tipo: Managed.
- Hostnames: o hostname de produção obtido acima, por exemplo `seu-projeto.pages.dev`. Se já criou o widget, abra suas configurações e adicione o hostname em **Hostname Management**.

Guarde a **Site key** (pública) e a **Secret key** (privada). Não desative a validação: o servidor confere o token, hostname e ação do formulário.

## 4. Configurar Cloudflare Pages

A integração exige Pages **Functions**. `npm run dev` e uma hospedagem apenas do diretório `dist` não executam a API. A função fica em `functions/api/forms.ts` no mesmo repositório; não existe um segundo servidor a manter.

No projeto Cloudflare Pages conectado ao repositório:

- Comando de build: `npm run build`.
- Diretório de saída: `dist`.
- Node.js: 22.13+ ou 24+.
- Se o projeto Pages tiver outro nome, ajuste `name` em `wrangler.jsonc`.

Em **Settings → Variables and Secrets**, configure no ambiente correto:

| Nome | Tipo | Valor |
| --- | --- | --- |
| `SUBMISSIONS_ENABLED` | Variável | `true` depois de configurar |
| `SITE_ORIGIN` | Variável | Origem exata, por exemplo `https://seu-projeto.pages.dev`, sem `/` final |
| `TURNSTILE_SITE_KEY` | Variável | Site key do widget |
| `TURNSTILE_SECRET_KEY` | Secret | Secret key do widget |
| `APPS_SCRIPT_URL` | Variável | URL `/exec` da implantação |
| `APPS_SCRIPT_SECRET` | Secret | Exatamente o mesmo segredo das propriedades do script |

Faça novo deploy após mudar essas configurações. A API não aceita envio de outros domínios. Se usar domínio personalizado, configure o domínio canônico e redirecione os demais para ele. O preview de outro hostname permanece bloqueado até receber configuração própria. Não compartilhe segredos de produção com previews de branches não confiáveis.

`public/_routes.json` limita a execução das Functions a `/api/*`; páginas e arquivos estáticos continuam sendo servidos normalmente.

## 5. Definir a edição e abrir o recebimento

Edite `src/data/submissions.ts`. Exemplo ilustrativo, a ser substituído pela edição real:

```ts
competitive: { enabled: true, edition: '2026-2', processId: 'competitivo-2026-2' },
directorate: { enabled: true, edition: '2026-2', processId: 'diretoria-2026-2' },
store: { enabled: false },
```

Os dois processos podem abrir/fechar independentemente. Para encerrar, altere `enabled` para `false` e publique. Para desligar todos os recebimentos, configure `SUBMISSIONS_ENABLED=false` e faça novo deploy.

Antes da abertura, a organização deve revisar o aviso exibido em `SubmissionPanel.tsx`, definir o prazo/critério de retenção e quem poderá acessar os dados, incluindo a necessidade da pergunta sobre cenário inclusivo. O checkbox registra ciência da finalidade; não substitui essas decisões. Ao alterar o aviso, atualize `privacyVersion` em `submissions.ts`.

**Nova edição:** altere `edition` e `processId`, mantendo os IDs dos arquivos Google. Cada registro mantém a edição e a versão com que foi recebido. Use filtros do Sheets para consultar o histórico. Não renomeie nem reordene cabeçalhos e não apague as colunas Protocolo/Hash; elas são usadas para evitar duplicações. A coluna `Status` pode ser atualizada manualmente. Não insira tabelas extras ou totais nas abas de recebimento: use outras abas para relatórios.

## 6. Testar antes de usar com dados reais

Use inicialmente cópias das planilhas e uma implantação/configuração de teste. Execute:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run build
npm.cmd run functions:check
```

Para testar o runtime Cloudflare local:

```powershell
Copy-Item .dev.vars.example .dev.vars
# Preencha .dev.vars com configurações de teste.
npm.cmd run dev:cloudflare
```

Abra `http://localhost:8788`. `SITE_ORIGIN` deve ser exatamente essa origem. A aplicação será a versão de `dist`: execute novo build após editar o front-end. `.dev.vars` é ignorado pelo Git. O comando normal `npm.cmd run dev` continua disponível para trabalhar no visual; nesse modo, o envio informa que está indisponível.

Para Turnstile local, use [as chaves oficiais de teste](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) e a configuração local isolada. A chave de sucesso padrão não retorna um hostname de produção: a validação rígida de hostname/ação deve continuar ativa. Prefira um widget real autorizado para `localhost` ao testar o fluxo completo. Nunca publique chaves de teste como proteção de produção.

Verificações manuais na implantação configurada:

1. Preencha diretoria com dados fictícios, revise, marque a ciência do aviso, conclua o Turnstile e envie. Deve aparecer protocolo somente depois de surgir a linha na aba Diretoria.
2. Envie inscrições competitivas fictícias para jogos diferentes, incluindo Player e Coach. Verifique os campos condicionais, o jogo e a função nas respectivas abas (por exemplo, VALORANT e CS2). Repita uma confirmação para verificar que não gera outra linha.
3. Confirme que ambos estão no mesmo arquivo e a loja está em outro.
4. Confirme que RA com zero inicial, telefone com `+55` e textos iniciados por `=` são valores literais. A gravação usa `RAW`, sem fórmulas.
5. Confira o estado fechado e a mensagem de indisponibilidade removendo temporariamente uma configuração no ambiente de teste.
6. Simule falha de rede. O site deve manter as respostas e repetir o mesmo protocolo ao tentar confirmar; nunca mostrar sucesso apenas porque a requisição saiu do navegador.
7. Abra a URL da planilha em uma janela sem login: as respostas não devem ser acessíveis. A URL do Apps Script, aberta por GET, não deve retornar respostas.

Os testes automatizados executam a validação e o código real do Apps Script com serviços Google simulados. Não comprovam permissões da sua conta, implantação `/exec`, cotas ou integração real do Turnstile. Esses itens exigem o teste acima.

### O formulário informa que o envio está indisponível

Abra `/api/forms` no mesmo endereço de produção do site. Essa consulta não envia respostas e não retorna segredos.

- `CONFIGURATION_ERROR`: a lista `issues` identifica as configurações que bloqueiam o envio, sem mostrar seus valores.
- `APPS_SCRIPT_URL_INVALID`: em **Google Apps Script → Implantar → Gerenciar implantações**, copie a URL do **aplicativo da Web**. São aceitos os formatos `https://script.google.com/macros/s/ID_DA_IMPLANTACAO/exec` e, para Google Workspace, `https://script.google.com/a/macros/DOMINIO/s/ID_DA_IMPLANTACAO/exec`. Cadastre somente essa URL em `APPS_SCRIPT_URL`, sem aspas ou espaços. O endereço da planilha, a URL do editor e a implantação de teste `/dev` não servem. O formato Workspace também precisa permitir acesso sem login; o formato da URL não garante essa permissão.
- `SUBMISSIONS_DISABLED`: configure `SUBMISSIONS_ENABLED` com o texto `true` em Production.
- `SITE_ORIGIN_INVALID`: use somente a origem de produção, com `https://` e sem caminho ou barra final.
- `TURNSTILE_SITE_KEY_MISSING` ou `TURNSTILE_SECRET_KEY_MISSING`: falta a respectiva chave do widget.
- `APPS_SCRIPT_SECRET_TOO_SHORT`: cadastre o mesmo segredo de pelo menos 32 caracteres no Pages e nas propriedades do Apps Script.
- `ORIGIN_NOT_ALLOWED`: abra o endereço de produção correspondente a `SITE_ORIGIN`, em vez do link temporário de uma implantação.
- `ok: true` com o formulário desativado em `enabled`: confira `src/data/submissions.ts` e publique a versão atual.

Depois de corrigir configurações no Pages, faça novo deploy e use **Verificar novamente** na revisão para preservar as respostas já preenchidas. Um diagnóstico `ok: true` confirma a configuração inicial; a gravação no Google só é comprovada após um envio e a presença da resposta na aba correta.

## Loja: pedidos, Pix e comprovantes

A página `/loja` possui catálogo, detalhes, tamanhos opcionais, revisão, Pix e anexo. Está em **prévia**, sem pagamentos ou envios, até cadastrar os dados oficiais. Consulte [o guia da loja](loja.md) para cadastrar produtos e ativar.

O cadastro fica em `src/data/store.ts`. A API valida produto, preço, quantidade, variação e tamanho no servidor. Só aceita comprovantes PNG/JPG/PDF de até 2 MB. O arquivo vai para uma pasta **restrita** do Google Drive (`STORE_RECEIPTS_FOLDER_ID`); a aba `Solicitacoes` recebe seu link, ID, nome, tipo e hash, sem o conteúdo binário. O status inicial é **Aguardando conferência**: não existe confirmação automática de pagamento nem reserva de estoque.

Atualize `Code.gs`, `Columns.gs` e `appsscript.json`, execute `setupSheets` e `setupStoreReceipts`, autorize o novo acesso ao Drive e publique uma **nova versão** da implantação existente. As novas colunas são adicionadas ao final, preservando respostas anteriores. A mesma tentativa reaproveita protocolo e arquivo após uma falha na planilha. Não remova arquivos enquanto houver confirmações pendentes. Compartilhe a pasta e a planilha somente com as contas da diretoria que precisam desse acesso. O visitante não precisa acessar o Google.

## Manutenção e limites

- Ao ativar/desativar modalidades em `src/features/recruitment/config.ts`, rode `npm.cmd run sheets:columns`, atualize `Columns.gs`, execute `setupSheets` e publique uma nova versão do Apps Script junto da atualização do site. O mapa de modalidades é gerado da mesma configuração do formulário. Abas de modalidades desativadas não são apagadas. Não renomeie as abas de recebimento manualmente.
- Ao adicionar perguntas, rode `npm.cmd run sheets:columns` e atualize `Columns.gs` no Google. O gerador usa os IDs e rótulos existentes. Alterar a ordem/semântica de colunas requer uma migração explícita: o script falha sem sobrescrever o histórico. Uma nova coluna só pode ser adicionada ao final; execute `setupSheets` antes de atualizar a implantação.
- Para mudanças incompatíveis de formulário, planeje nova versão de esquema e abas antes de aceitar respostas. O formato atual é versão 1.
- Não edite respostas enquanto houver um envio com confirmação pendente. A mesma página preserva protocolo e conteúdo para repetir com segurança. Recarregar/fechar a página descarta as respostas; não há gravação de dados pessoais em localStorage. Se perder a página após um envio incerto, contate a equipe antes de iniciar outro. Esta proteção não impede inscrições distintas voluntárias da mesma pessoa.
- Se aparecer `ID_CONFLICT`, o protocolo já existe com outro conteúdo. Confira no Sheets; não apague protocolos para forçar novo envio.
- O bloqueio de concorrência protege as gravações feitas por este projeto Apps Script. Use uma única implantação escritora por conjunto de planilhas. Não exclua registros durante tentativas pendentes; a remoção também remove a referência usada para deduplicação.
- Turnstile reduz spam, mas não garante ausência de abuso. O endpoint Apps Script público pode consumir cotas mesmo rejeitando uma assinatura. Monitore disponibilidade/execuções sem registrar respostas pessoais. Para tráfego elevado, considerar limite adicional de requisições e outra estratégia de armazenamento.
- Não há fila durável: se Google estiver indisponível, o visitante recebe erro e deve tentar confirmar novamente. Nenhum sucesso é inventado.
- Os serviços têm limites gratuitos. [Pages Functions](https://developers.cloudflare.com/pages/functions/pricing/), [Apps Script](https://developers.google.com/apps-script/guides/services/quotas).

Referências: [Apps Script Web Apps](https://developers.google.com/apps-script/guides/web), [serviços avançados](https://developers.google.com/apps-script/guides/services/advanced), [segredos no Pages](https://developers.cloudflare.com/pages/functions/bindings/#secrets), [validação do Turnstile](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
