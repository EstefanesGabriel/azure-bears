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
- Navegação na ordem da referência NRG: Início, Sobre nós, Equipes, Notícias, Loja e Parceiros.
- Diretoria e Processos seletivos acessíveis no rodapé e no menu mobile.
- Destinos das próximas páginas mostram um aviso de disponibilidade. Não são implementações dessas páginas.
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

Implementar Sobre nós, Equipes, Notícias, Loja e Parceiros seguindo a navegação. Diretoria e Seletivas continuam no escopo geral. Integrações, metadados de compartilhamento com imagens oficiais e pré-renderização das páginas serão trabalhados nas etapas correspondentes. Ainda não há configuração de publicação ou domínio.
