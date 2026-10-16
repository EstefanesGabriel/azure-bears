# Parceiros

A página `/parceiros` e as logos da Home usam o cadastro em `src/data/partners.ts`.

## Alterar a Station

- `headline`: frase de destaque.
- `description`: lista de parágrafos; cada texto fica em um parágrafo separado.
- A imagem existente continua em `public/partners/station.png`, sem modificações.

## Adicionar ou remover

Duplique um objeto da lista `partners`, altere os campos e escolha um `id` único, sem espaços. Exemplo:

```ts
{
  id: 'novo-parceiro',
  name: 'Nome do parceiro',
  visible: true,
  category: 'Parceiro',
  headline: 'Frase de apresentação.',
  description: ['Primeiro parágrafo.', 'Segundo parágrafo.'],
  logo: {
    src: '/partners/novo-parceiro.png',
    alt: 'Logo do novo parceiro',
  },
  // url: 'https://endereco-oficial.com.br',
},
```

Coloque a imagem em `public/partners/`. Prefira PNG transparente, legível sobre fundo escuro. A logo é exibida inteira, sem recorte; se faltar ou não carregar, aparece o nome do parceiro. O campo `url` é opcional: sem endereço, nenhum link externo é mostrado.

Para ocultar um parceiro na página e na Home, use `visible: false`. Para remover definitivamente, exclua seu objeto. A ordem dos objetos define a apresentação. Os blocos se adaptam à quantidade de parceiros e ficam empilhados em telas pequenas. Com a lista vazia, a página mostra uma mensagem de novidades e mantém o contato para novas parcerias.

Depois de editar, execute `npm.cmd run build` e publique pelo fluxo habitual do projeto.
