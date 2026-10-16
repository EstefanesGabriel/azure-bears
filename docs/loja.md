# Loja Azure Bears

A loja está em `/loja`, com detalhes em `/loja/:slug`. A versão entregue é uma **prévia**, com três itens iniciais: camiseta, calça e caneca. Os avisos editoriais de demonstração não são exibidos na interface. Não há preços, dados Pix ou recebimento de pedidos habilitados. Dados digitados e arquivos escolhidos na prévia ficam apenas na memória da página, sem envio.

## 1. Produtos e imagens

Edite **`src/data/store.ts`**. `products` é o catálogo real e `previewProducts` contém apenas exemplos. Copie os exemplos desejados para `products`, ajuste seus dados e adicione `priceCents`. Exemplo de estrutura (preço meramente ilustrativo, substitua pelo oficial):

```ts
export const products: Product[] = [
  {
    id: 'camiseta-oficial',
    slug: 'camiseta-oficial',
    name: 'Camiseta Azure',
    category: 'Vestuário',
    description: 'Substitua pela descrição real do produto.',
    badge: 'Vista a Azure',
    visible: true,
    priceCents: 7990, // Exemplo: R$ 79,90. Confirme o preço oficial.
    image: { src: '/images/store/camiseta.png', alt: 'Camiseta Azure' },
    requests: {
      enabled: true,
      variants: [], // Ex.: ['Azul', 'Branca']; vazio oculta o seletor.
      sizes: ['P', 'M', 'G', 'GG'],
      maxQuantity: 5, // Inteiro entre 1 e 20.
    },
  },
]
```

- Para **canecas e outros itens sem tamanho**, use `sizes: []`.
- Para esconder um item, use `visible: false` ou remova seu objeto. O histórico de pedidos continua na planilha.
- Para exibir sem receber pedidos, use `requests.enabled: false`.
- Use IDs e slugs únicos; mantenha os IDs estáveis para o histórico. Slugs devem usar letras minúsculas, números e hífens.
- As categorias são geradas pelo catálogo. A grade se adapta à quantidade de itens; um único resultado não estica por toda a tela.
- O destaque da Home usa o mesmo catálogo real e respeita `visible`.
- Fotos vão em **`public/images/store/`**. Os exemplos aguardam `camiseta.png`, `calca.png` e `caneca.png`. No código, use `/images/store/...` (sem `public`). Pode escolher outros nomes para novos itens.
- Imagens ausentes na loja mostram o símbolo da Azure e “Foto em breve”. Nenhuma foto de produto foi inventada.

## 2. Pix e retirada/entrega

Ainda em `src/data/store.ts`, preencha `storeSettings`:

- `fulfillment`: condições reais de retirada/entrega, incluindo eventuais custos no valor anunciado. Não há cálculo de frete.
- `pix.key`: chave Pix oficial, em texto.
- `pix.recipient`: nome do titular exatamente como aparece no banco.
- `pix.qrImage`: opcional, caminho de uma imagem de QR Code **gerada no banco da Azure**. Coloque, por exemplo, `pix.png` em `public/images/store/` e use `/images/store/pix.png`.
- `pix.copyPaste`: opcional, código completo Pix Copia e Cola fornecido pelo banco. Não é a chave simples.

O site exibe o QR Code para ser escaneado pelo aplicativo bancário e permite copiar a chave/código. Não abre câmera, não gera cobranças e não transfere dinheiro. Utilize QR/código reutilizável **sem valor fixo**; QR com valor pré-definido pode divergir da quantidade escolhida. Confira titular, chave, QR e Copia e Cola no banco antes de divulgar. O visitante vê o total e deve conferir o valor antes de pagar. Chave e titular serão informações públicas no site.

O servidor calcula o total com base no catálogo e rejeita preço unitário desatualizado. Valores na planilha ficam em **centavos**, identificados nos cabeçalhos. Um pedido contém um produto com suas opções e quantidade. Para pedir outro produto, inicia-se outro pedido.

## 3. Preparar Google Drive e Sheets

A planilha continua privada. Um arquivo PDF/PNG/JPG não é armazenado dentro de uma célula: **a planilha recebe um link para o comprovante privado no Drive**.

1. Na mesma conta que executa o Apps Script, crie uma pasta no **Meu Drive**, por exemplo “Azure — Comprovantes da loja”. Em Compartilhar, deixe **Acesso geral: Restrito**. Compartilhe apenas com contas específicas da diretoria, conforme necessário. Evite uma pasta dentro de outra compartilhada publicamente. Este fluxo usa Meu Drive, não drives compartilhados.
2. Copie o ID da pasta, o trecho após `/folders/` na URL.
3. Nas **Configurações do projeto → Propriedades do script**, adicione `STORE_RECEIPTS_FOLDER_ID` com esse ID. Mantenha `STORE_SPREADSHEET_ID`, `RECRUITMENT_SPREADSHEET_ID` e `APPS_SCRIPT_SECRET` existentes.
4. Atualize no editor do Google os arquivos do repositório: **`integrations/google-apps-script/Code.gs`**, **`Columns.gs`** e **`appsscript.json`**. Se o manifesto não aparecer, habilite “Mostrar o arquivo de manifesto appsscript.json no editor” nas configurações. Preserve a configuração do serviço avançado **Google Sheets API v4**.
5. Execute **`setupSheets`**. As colunas novas serão acrescentadas ao final da aba `Solicitacoes`, sem apagar pedidos antigos. Não renomeie nem reordene cabeçalhos.
6. Execute **`setupStoreReceipts`** e autorize o acesso ao Drive solicitado. O novo escopo `https://www.googleapis.com/auth/drive` é necessário para criar arquivos na pasta escolhida com `DriveApp`. O código utiliza somente a pasta configurada; a autorização do Google é mais ampla. A função verifica se a pasta está restrita, sem enviar um comprovante.
7. Vá a **Implantar → Gerenciar implantações → Editar → Nova versão → Implantar**. Execute como sua própria conta e permita acesso ao aplicativo da Web por **Qualquer pessoa**, para o servidor do site conseguir enviar. As planilhas e arquivos continuam restritos; o endpoint exige assinatura secreta e não permite consultar respostas. Se a conta institucional não oferecer acesso anônimo, o administrador precisa liberar essa opção ou você deve utilizar uma conta que permita a implantação.
8. Mantendo a implantação existente, a URL `/exec` continua a mesma. Se criar outra, atualize `APPS_SCRIPT_URL` no Cloudflare e faça novo deploy. **Nunca coloque o segredo no frontend.**

A diretoria deve ter acesso tanto à planilha quanto à pasta para abrir os links. O script recusa uma pasta com acesso geral público ou de domínio; não torna arquivos públicos e não muda compartilhamentos existentes.

## 4. Ativar quando os dados oficiais estiverem prontos

Depois das configurações acima:

1. Cadastre os produtos reais, fotos, preços, Pix e condições de retirada/entrega.
2. Em `src/data/store.ts`, altere `preview: false`.
3. Em `src/data/submissions.ts`, altere **somente** `store.enabled` para `true`.
4. Execute `npm.cmd test`, `npm.cmd run build` e publique as alterações no Cloudflare pelo fluxo do projeto.
5. Valide um pedido controlado com dados fictícios e comprovante de teste, sem efetuar transferência desnecessária. Confira a aba `Solicitacoes`: protocolo, opções, quantidade, total, contato, status **Aguardando conferência** e link do comprovante. Confira também se uma pessoa não autorizada não consegue abrir o link.

`/api/forms` deve indicar `enabled.store: true`. Esse diagnóstico confirma a configuração inicial, não garante acesso ao Google: só o teste de envio confirma a integração completa. O Pix fica oculto enquanto o catálogo/Pix/recebimento estiverem desativados ou o diagnóstico inicial falhar.

## 5. Comprovantes e conferência

- Formatos: PNG, JPG ou PDF, até **2 MB** por pedido. Tipo declarado e assinatura inicial do arquivo são verificados no site e servidor; isso não é análise antivírus nem validação de autenticidade de pagamento. Arquivos não são renderizados dentro do site.
- Respostas são acrescentadas à planilha, sem substituir as anteriores. Conteúdo dos arquivos não vai nas células; a pasta armazena o arquivo e a planilha seu link, ID, nome original, tipo e SHA-256.
- O status inicial é **Aguardando conferência**. A diretoria confere no banco e atualiza a coluna Status manualmente. Receber um comprovante não comprova liquidação de pagamento nem reserva estoque.
- Em falha de rede, o visitante deve manter a página aberta e usar a tentativa com o mesmo protocolo. Isso evita duplicar a linha e o arquivo. O formulário bloqueia a edição durante envio, confirmação incerta ou sucesso.
- Se o arquivo for salvo e a planilha falhar, ele é reaproveitado na próxima tentativa. Sem nova tentativa, pode sobrar um arquivo sem linha: confira pelo protocolo no nome antes de fazer limpeza. Não exclua arquivos de pedidos com confirmação pendente.
- Não há persistência local de contatos ou comprovantes, envio de e-mail, controle de estoque, carrinho, cálculo de frete ou confirmação automática pelo banco.
- Para exclusão solicitada pelo titular, remova o registro correspondente **e** seu arquivo no Drive, conforme o procedimento da equipe. Não publique a pasta, a planilha nem os comprovantes no repositório.

Mais detalhes da integração e cotas: [Google Sheets](google-sheets.md). API utilizada: [DriveApp](https://developers.google.com/apps-script/reference/drive/drive-app) e [Folder.createFile](https://developers.google.com/apps-script/reference/drive/folder#createFile(BlobSource)).
