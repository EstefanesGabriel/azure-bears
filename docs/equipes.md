# Cadastro de equipes, lines e jogadores

Edite **`src/data/teams.ts`**. A ordem dos itens é a ordem de apresentação. O cadastro alimenta `/equipes`, suas páginas internas e os links de modalidades da Home.

## Mostrar, ocultar e adicionar modalidades

Cada item de `teamModalities` tem `id`, `name`, `category`, `icon`, `visible` e `lines`. Para ocultar, use `visible: false`; a rota também deixa de mostrar o conteúdo. Para adicionar, copie um item e escolha um `id` único, em minúsculas e com hífens. O `id` forma a URL: `/equipes/valorant`.

Todas as nove modalidades cadastradas originalmente no site estão presentes. A visibilidade aqui é independente das seletivas: mostrar TFT em Equipes não abre sua inscrição. As inscrições continuam configuradas em `src/features/recruitment/config.ts`.

`aliases` é uma lista opcional de termos para busca, como `['cs', 'cs2']`.

## Lines e jogadores

As lines iniciais e os jogadores são identificadores genéricos autorizados para preparar a apresentação. Os números de espaços não representam elencos oficiais. VALORANT começa com duas lines; as demais modalidades, com uma. `placeholderLine('valorant', 3, 5)` adiciona uma terceira line com cinco espaços para jogadores.

Quando tiver os dados, substitua uma chamada a `placeholderLine` por um objeto como este:

```ts
{
  id: 'line-01',
  name: 'Nome oficial da line',
  description: 'Apresentação oficial da line.',
  visible: true,
  placeholder: false,
  photo: {
    src: '/images/teams/valorant/line-01/line.png',
    alt: 'Descrição da foto da line',
  },
  players: [
    {
      id: 'jogador-01',
      nickname: 'Nick oficial',
      name: 'Nome do jogador',
      role: 'Função no time',
      course: 'Curso na UTFPR',
      bio: 'Apresentação do jogador.',
      visible: true,
      placeholder: false,
      photo: {
        src: '/images/teams/valorant/line-01/jogador-01.png',
        alt: 'Retrato do jogador',
      },
      socials: [{ label: 'Instagram', url: 'https://www.instagram.com/SEU_PERFIL/' }],
    },
  ],
}
```

Os textos acima são exemplos para substituir pelos dados oficiais. `name`, `role`, `course`, `bio` e `socials` do jogador são opcionais. Use links HTTPS nas redes sociais. Não cadastre informações pessoais sem autorização.

Para adicionar jogadores, duplique o objeto dentro de `players`, alterando `id`, dados e foto. Para adicionar lines, duplique o objeto dentro de `lines`. Os IDs devem ser únicos dentro de cada lista. Use `visible: false` em qualquer nível para retirar um registro sem apagá-lo. Uma line sem jogadores e uma modalidade sem lines têm estados de apresentação próprios.

## Onde colocar as imagens

As pastas de fotos já estão preparadas em `public/images/teams/`. Exemplo do VALORANT:

```text
public/images/teams/valorant/line-01/line.png
public/images/teams/valorant/line-01/jogador-01.png
public/images/teams/valorant/line-01/jogador-02.png
public/images/teams/valorant/line-01/jogador-03.png
public/images/teams/valorant/line-01/jogador-04.png
public/images/teams/valorant/line-01/jogador-05.png
public/images/teams/valorant/line-02/line.png
public/images/teams/valorant/line-02/jogador-01.png
```

As demais modalidades seguem o mesmo padrão usando seu `id`: `league-of-legends`, `counter-strike-2`, `brawl-stars`, `ea-fc`, `free-fire`, `teamfight-tactics`, `wild-rift` e `rocket-league`.

Fotos de line usam uma área horizontal; retratos usam uma área vertical. Prefira proporções 16:10 e 4:5, respectivamente. Imagens são cortadas com `object-fit: cover`. Você pode mudar nomes ou extensões no campo `photo.src`, sempre sem `public` no início. Atualize também o texto `alt` para descrever a foto real.

Enquanto o arquivo não existe, o espaço mostra a marca da Azure e “Foto em breve”, sem imagens inventadas ou ícone de arquivo quebrado. Os ícones dos jogos continuam em `public/game-icons/`.

## Navegação e movimentos

- `/equipes`: modalidades, busca por nome/categoria/apelido e links para as lines.
- `/equipes/valorant`: todas as lines visíveis de VALORANT.
- `/equipes/valorant/line-01`: foto da line e cards dos jogadores.
- Clique em um jogador para abrir o perfil. Escape, botão de fechar ou clique fora fecham o perfil; o foco retorna ao card.

Os movimentos reutilizam o sistema do site e acrescentam profundidade no hero, interação nos ícones e entrada do perfil. Não há animações contínuas; `prefers-reduced-motion` é respeitado.

Depois de editar os dados ou adicionar fotos, gere o build e publique a versão atual. As alterações no código não modificam automaticamente um deploy anterior.
