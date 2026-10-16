# Azure Bears Web

Website institucional do Azure Bears, organização universitária de e-sports vinculada à UTFPR.

## Desenvolvimento local

Requer Node.js 22.12+ (ou 20.19+) e npm.

```sh
npm install
npm run dev
```

No PowerShell com scripts bloqueados, utilize `npm.cmd install` e `npm.cmd run dev`.

`npm run build` verifica TypeScript e gera o site estático em `dist`. `npm run preview` permite conferir esse build localmente.

Para colocar o site no ar pela primeira vez, siga [Publicar no Cloudflare Pages](docs/cloudflare-pages.md). O guia usa o repositório GitHub existente e o endereço gratuito `pages.dev`.

## Escopo desta etapa

- Home responsiva com hero, apresentação, notícias, equipes, loja, parceiros, participação e rodapé.
- Sobre Nós em `/sobre`, com os textos oficiais fornecidos e espaços reservados às imagens.
- Equipes em `/equipes`, com nove modalidades, lines, perfis de jogadores e espaços reservados às fotos.
- Navegação na ordem da referência NRG: Início, Sobre nós, Equipes, Notícias, Loja e Parceiros.
- Diretoria e Processos seletivos acessíveis no rodapé e no menu mobile.
- Seletivas em `/seletivas`: escolha entre times competitivos e diretoria, com formulários por etapas e revisão.
- Destinos das demais páginas mostram um aviso de disponibilidade. Não são implementações dessas páginas.
- Recebimento preparado com Cloudflare Pages Functions, Turnstile e Apps Script/Google Sheets; desligado até configurar os serviços. Sem autenticação de visitantes ou pagamentos.

## Conteúdo e materiais oficiais

- `src/data/site.ts`: marca, apresentação, navegação, redes sociais e mídias do hero.
- `src/data/home.ts`: textos da Home e listas de notícias, modalidades, produtos e parceiros.
- `src/models/content.ts`: contratos de conteúdo.
- `src/styles/index.css`: tokens e composição visual; os títulos usam Teko e os textos usam Inter.
- `public/brand`: três variantes vetoriais dos logos fornecidos, lettering separado e composição horizontal para o site.

As listas começam vazias para não inventar informações da organização. Ao adicionar registros oficiais, as seções passam automaticamente a exibir cards. As datas das notícias devem ser ISO 8601 com fuso explícito. As páginas de detalhes continuam pendentes até suas respectivas etapas.

Para imagens locais, coloque os arquivos em `public/media/` e use caminhos como `/media/foto.webp` nos dados. Essa pasta deve ser criada quando houver arquivos reais. A origem das imagens pode ser trocada posteriormente sem alterar os componentes. Use `site.logo`, `site.heroImage` e `site.heroVideo` para substituir as composições temporárias. O vídeo deve ser decorativo; o conteúdo textual permanece independente dele. Há controle de pausa e respeito a movimento reduzido.

O símbolo branco com contorno azul foi escolhido para os fundos escuros do site. O cabeçalho e rodapé usam `azure-bears-lockup.svg`; o hero usa `azure-bears-symbol-white.svg`, e a seção de equipes usa `azure-bears-wordmark.svg`. As três variantes originais foram vetorizadas com fundo transparente. Todos os SVGs usam paths reais, sem imagens raster embutidas. A versão completa mantém os detalhes e o texto menor do material de referência, sendo adequada a tamanhos maiores e fundos claros.

O lettering isolado foi redesenhado geometricamente com base na marca; não é uma identificação da fonte original. Teko é uma aproximação condensada e angular para os títulos gerais, com suporte aos acentos em português. As fontes Teko e Inter são servidas localmente pelo pacote Fontsource, sem chamadas para Google Fonts. Os ícones de interface são Lucide. Não foram utilizados ativos da NRG.

## Próximas etapas

### Logo da patrocinadora Station

Coloque o PNG em `public/partners/station.png`, mantendo o nome em letras minúsculas. A Home já está configurada para carregá-lo, sem necessidade de editar componentes. Prefira uma imagem com fundo transparente e uma versão legível sobre fundo escuro. Após adicionar o arquivo, atualize a página do navegador. Até o arquivo estar disponível, será exibido apenas o nome Station, evitando uma imagem quebrada. O cadastro compartilhado entre a Home e a página de Parceiros está em `src/data/partners.ts`; um link oficial pode ser acrescentado no campo opcional `url`. Veja [como editar, adicionar ou remover parceiros](docs/parceiros.md).

Implementar Notícias, Loja e Parceiros seguindo a navegação. Metadados de compartilhamento com imagens oficiais e pré-renderização das páginas serão trabalhados nas etapas correspondentes. A publicação está configurada para Cloudflare Pages; consulte o guia de deploy.

## Sobre Nós

A página `/sobre` utiliza os textos fornecidos, sem reescrita, em `src/data/about.ts`. A composição está em `src/pages/AboutPage.tsx` e `src/styles/about.css`.

Coloque as imagens em `public/images/about/`, preservando os nomes abaixo. Os `src` já estão configurados como `/images/about/imagem3.png`, etc. Basta adicionar os arquivos e atualizar a página. Enquanto faltarem, os espaços ficam vazios, sem imagens inventadas nem ícones de imagem quebrada.

| Seção | Arquivos e posições |
| --- | --- |
| História | `imagem3.png`, `imagem4.png`, `imagem5.png`, `imagem6.png`, nos quatro pontos da timeline |
| Conquistas estaduais e regionais | `imagem7.png`, `imagem8.png`, `imagem9.png`, nos três resultados, na ordem fornecida |
| Resultados nacionais | `imagem10.png`, `imagem11.png`, na coluna ao lado dos títulos |
| Entenda o cenário | Sem imagens; blocos Copa Aliança e JUBS |
| Nossas equipes | `imagem12.png` para VALORANT; `imagem13.png` para League of Legends; EA FC e Brawl Stars somente em texto |
| Jogadores premiados | `imagem14.png` para TAEK; `imagem15.png` para KASAI |
| Comunidade | `imagem16.png` grande acima; `imagem17.png` e `imagem18.png` menores abaixo |

Ao escolher as fotos, ajuste os textos alternativos (`alt`) em `src/data/about.ts` para descrever os materiais reais. Os marcos da história preservam a imagem inteira; as demais imagens preenchem a área reservada com `object-fit: cover`.

## Equipes

A página `/equipes` reúne as nove modalidades e permite navegar por modalidade → line → perfil do jogador. O cadastro está em `src/data/teams.ts`; `visible: false` retira uma modalidade, line ou jogador sem apagá-lo. Essa visibilidade não altera as seletivas.

As lines e os jogadores começam com identificadores genéricos. Fotos entram em `public/images/teams/<modalidade>/<line>/`: `line.png` para o grupo e `jogador-01.png`, `jogador-02.png` etc. para os retratos. As pastas já estão preparadas. Consulte [docs/equipes.md](docs/equipes.md) para substituir os cadastros e adicionar elencos reais.

## Movimento e interações

- `src/components/MotionEffects.tsx`: entradas ao entrar na tela, com sequência curta, profundidade do hero acompanhando o mouse e inclinação/brilho dos cards interativos. Inclui uma linha de progresso da leitura no topo.
- `src/styles/motion.css`: transições de botões, ícones, imagens, seleção de jogos e abertura do menu mobile.
- Use `data-reveal` em um bloco para animar sua primeira entrada, `data-motion-card` em um card interativo e `data-parallax` no contêiner da arte do hero.

Os efeitos respeitam `prefers-reduced-motion`, inclusive quando a preferência muda com a página aberta. Inclinação e profundidade são limitadas a dispositivos com mouse; não interferem na rolagem por toque. Não há movimentos em loop nem alteração dos números e textos. Campos de formulário permanecem estáveis. O conteúdo continua visível sem animações; foco de teclado interrompe uma entrada em andamento. Observadores, eventos e animações são limpos ao trocar de página.

## Formulário de seletivas

O botão **Faça parte** abre `/seletivas`. No competitivo, o fluxo é: jogo → ciência das regras → informações pessoais → informações acadêmicas → função → perguntas do jogo (somente Player) → perguntas finais → revisão.

Na diretoria, o fluxo é: nome, nick, e-mail e celular com DDD → motivação e contribuição, área de interesse e descrição da área → revisão. Todos os sete campos são obrigatórios; a área é uma seleção única entre Modalidades, Eventos, Marketing, Administrativo e Produtos. Voltar ou editar uma etapa mantém as respostas dentro do formulário. Os dois processos têm validações independentes.

- `src/features/recruitment/config.ts`: modalidades, visibilidade, perguntas, campi e alternativas. TFT, Wild Rift e Rocket League estão cadastrados com `visible: false`; alterar para `true` os inclui no seletor com suas perguntas prontas.
- `src/features/recruitment/form.ts`: validação com Zod por etapa e completa, incluindo os ramos condicionais. A validação completa remove respostas que não se aplicam à modalidade/função atual.
- `src/features/recruitment/QuestionField.tsx`: campos acessíveis com React Hook Form.
- `src/features/recruitment/directorate.ts` e `DirectorateForm.tsx`: perguntas, áreas, validação e fluxo da diretoria.
- `src/pages/RecruitmentPage.tsx` e `src/styles/recruitment.css`: fluxo, revisão e visual responsivo.

As respostas ficam na memória da página até o envio. A revisão consulta a disponibilidade da API e permite enviar somente quando a integração estiver configurada e o processo aberto. A confirmação inclui um protocolo após a gravação no Google Sheets. Não há localStorage nem envio de e-mail. Em uma falha de confirmação, o formulário mantém o mesmo protocolo e as mesmas respostas para tentar novamente.

### Ativar o recebimento no Google Sheets

Siga o guia completo em [docs/google-sheets.md](docs/google-sheets.md). Ele explica como criar as duas planilhas privadas, publicar os scripts de `integrations/google-apps-script`, configurar Turnstile/Cloudflare e abrir uma edição em `src/data/submissions.ts`. As configurações vêm desativadas e nenhum segredo real acompanha o código.

Os formulários existentes de competitivo e diretoria já usam o componente de envio. O serviço também aceita solicitações da loja, com validação de produto/opções; a página e o formulário da loja continuam para a etapa própria.

O arquivo das seletivas organiza o competitivo em abas por modalidade (VALORANT, CS2, League of Legends, Brawl Stars, EA FC e Free Fire), além de Diretoria. Cada aba mantém o histórico identificado por edição. O guia também explica como usar o endereço gratuito `pages.dev` no Turnstile, sem comprar domínio.

Execute `npm.cmd test` (Node.js 22.13+ ou 24+) para verificar as validações e condicionais, e `npm.cmd run build` para validar os tipos e gerar a aplicação.

### Ícones dos jogos

Coloque os ícones PNG em `public/game-icons/`, com os nomes abaixo. O seletor de modalidades já carrega esses caminhos; basta adicionar os arquivos e atualizar a página.

| Jogo | Arquivo |
| --- | --- |
| Brawl Stars | `brawl-stars.png` |
| EA FC | `ea-fc.png` |
| Free Fire | `free-fire.png` |
| VALORANT | `valorant.png` |
| League of Legends | `league-of-legends.png` |
| Counter-Strike 2 | `counter-strike-2.png` |
| Teamfight Tactics (oculto) | `teamfight-tactics.png` |
| Wild Rift (oculto) | `wild-rift.png` |
| Rocket League (oculto) | `rocket-league.png` |

Prefira PNGs com fundo transparente, legíveis sobre fundo escuro e com pouca margem ao redor do símbolo. As imagens são ajustadas sem distorção ou corte. Enquanto um arquivo não existir ou não puder ser carregado, o card mantém o espaço vazio reservado ao ícone e o nome completo do jogo, sem abreviação ou imagem quebrada. Os caminhos estão no campo `icon` de `src/features/recruitment/config.ts`; para usar outra extensão, ajuste esse campo.
