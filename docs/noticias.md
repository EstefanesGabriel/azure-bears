# Notícias

## Situação atual

A área está temporariamente desativada. Para reativar, descomente a entrada de Notícias em `src/data/site.ts`, os imports/componentes/rotas e o título de artigo em `src/app/App.tsx`, e o import, a função `NewsSection` e sua chamada em `src/pages/HomePage.tsx`. O cadastro, as páginas e os estilos permanecem preservados. Enquanto desativada, a seção não aparece na Home nem nos menus, e os endereços de notícias exibem a página de rota não encontrada.

Edite `src/data/news.ts`. O mesmo cadastro alimenta `/noticias`, as páginas individuais e as três notícias mais recentes da Home. Não é necessário criar componentes ou rotas para cada publicação.

O cadastro inclui duas publicações iniciais, sem avisos editoriais nas telas. Edite seus textos diretamente no cadastro. Não há imagens de notícias inventadas: sem foto, a listagem usa um espaço gráfico com texto.

## Adicionar

Adicione um objeto à lista `news`:

```ts
{
  id: 'identificador-unico',
  slug: 'titulo-da-noticia',
  title: 'Título da notícia',
  summary: 'Resumo curto exibido na listagem e na Home.',
  category: 'Comunidade',
  publishedAt: '2026-10-15', // Data real, no formato YYYY-MM-DD.
  visible: true,
  image: {
    src: '/images/news/minha-foto.png',
    alt: 'Descrição da foto para quem usa leitor de tela',
  },
  content: [
    { paragraphs: ['Parágrafo de abertura.', 'Outro parágrafo.'] },
    { heading: 'Subtítulo opcional', paragraphs: ['Texto desta seção.'] },
  ],
},
```

- `id` e `slug` devem ser únicos. No slug, use letras minúsculas, números e hífens. Ele forma o endereço `/noticias/titulo-da-noticia`; mantenha-o para preservar links compartilhados.
- Coloque as fotos em `public/images/news/`. O caminho no cadastro começa com `/images/news/`. `image` é opcional; se ausente ou não carregar, há uma apresentação textual na listagem.
- `content` aceita quantas seções e parágrafos precisar. O texto é renderizado como texto, não HTML.
- As categorias dos filtros são geradas automaticamente. A busca considera título, resumo e categoria, ignorando acentos e maiúsculas.
- As notícias são ordenadas por data, da mais recente para a mais antiga. O primeiro resultado ocupa o destaque; não existe dependência de uma quantidade fixa de notícias.
- Para retirar, remova o objeto ou use `visible: false`. Isso oculta a notícia na Home, lista, sugestões e página individual. O visitante de um link antigo verá “Notícia não encontrada”. Ocultar não protege conteúdo confidencial: o cadastro é público no código do site.
- Não use datas futuras esperando agendamento: a publicação é controlada por `visible` e pelo deploy.
- Com a lista vazia, a página e a Home exibem suas mensagens de novidades em breve.

Após editar, rode `npm.cmd run build` e publique pelo fluxo habitual. É um cadastro no repositório, sem painel administrativo ou serviço externo.
