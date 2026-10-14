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

## Escopo desta etapa

- Home responsiva com hero, apresentação, notícias, equipes, loja, parceiros, participação e rodapé.
- Sobre Nós em `/sobre`, com os textos oficiais fornecidos e espaços reservados às imagens.
- Navegação na ordem da referência NRG: Início, Sobre nós, Equipes, Notícias, Loja e Parceiros.
- Diretoria e Processos seletivos acessíveis no rodapé e no menu mobile.
- Seletivas em `/seletivas`: escolha entre times competitivos e diretoria, com formulários por etapas e revisão.
- Destinos das demais páginas mostram um aviso de disponibilidade. Não são implementações dessas páginas.
- Sem serviços externos, coleta de dados, Cloudflare, armazenamento remoto, autenticação ou pagamentos.

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

Coloque o PNG em `public/partners/station.png`, mantendo o nome em letras minúsculas. A Home já está configurada para carregá-lo, sem necessidade de editar componentes. Prefira uma imagem com fundo transparente e uma versão legível sobre fundo escuro. Após adicionar o arquivo, atualize a página do navegador. Até o arquivo estar disponível, será exibido apenas o nome Station, evitando uma imagem quebrada. O cadastro está em `src/data/home.ts`; um link oficial pode ser acrescentado futuramente no campo opcional `url`.

Implementar Equipes, Notícias, Loja e Parceiros seguindo a navegação. Integrações, metadados de compartilhamento com imagens oficiais e pré-renderização das páginas serão trabalhados nas etapas correspondentes. Ainda não há configuração de publicação ou domínio.

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

## Formulário de seletivas

O botão **Faça parte** abre `/seletivas`. No competitivo, o fluxo é: jogo → ciência das regras → informações pessoais → informações acadêmicas → função → perguntas do jogo (somente Player) → perguntas finais → revisão.

Na diretoria, o fluxo é: nome, nick, e-mail e celular com DDD → motivação e contribuição, área de interesse e descrição da área → revisão. Todos os sete campos são obrigatórios; a área é uma seleção única entre Modalidades, Eventos, Marketing, Administrativo e Produtos. Voltar ou editar uma etapa mantém as respostas dentro do formulário. Os dois processos têm validações independentes.

- `src/features/recruitment/config.ts`: modalidades, visibilidade, perguntas, campi e alternativas. TFT, Wild Rift e Rocket League estão cadastrados com `visible: false`; alterar para `true` os inclui no seletor com suas perguntas prontas.
- `src/features/recruitment/form.ts`: validação com Zod por etapa e completa, incluindo os ramos condicionais. A validação completa remove respostas que não se aplicam à modalidade/função atual.
- `src/features/recruitment/QuestionField.tsx`: campos acessíveis com React Hook Form.
- `src/features/recruitment/directorate.ts` e `DirectorateForm.tsx`: perguntas, áreas, validação e fluxo da diretoria.
- `src/pages/RecruitmentPage.tsx` e `src/styles/recruitment.css`: fluxo, revisão e visual responsivo.

As respostas ficam somente na memória da página; não há localStorage, envio de e-mail ou chamadas para um serviço de recebimento. O aviso de prévia aparece desde o início e **Enviar inscrição** permanece desabilitado. A integração de envio será feita em uma etapa futura; não há confirmação fictícia de inscrição.

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
