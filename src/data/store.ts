import type { Product } from '../models/content.ts'

// Cadastro central da loja. Copie um exemplo de previewProducts para products.
// Preços em centavos: 7990 = R$ 79,90. sizes: [] remove a escolha de tamanho.
export const products: Product[] = []

export const storeSettings = {
  preview: true, // Desative somente após cadastrar produtos, Pix e integrar comprovantes.
  fulfillment: '', // Informe como funciona a retirada/entrega antes de abrir pedidos.
  pix: {
    key: '',
    recipient: '',
    qrImage: '', // Ex.: /images/store/pix.png — QR fornecido pelo banco da Azure.
    copyPaste: '', // Opcional: código Pix Copia e Cola fornecido pelo banco.
  },
}

// Exemplos de apresentação; não são produtos à venda nem preços oficiais.
export const previewProducts: Product[] = [
  { id: 'camiseta', slug: 'camiseta', name: 'Camiseta Azure', category: 'Vestuário',
    description: 'A identidade da Azure para acompanhar você dentro e fora das partidas.', badge: 'Vista a Azure',
    image: { src: '/images/store/camiseta.png', alt: 'Camiseta Azure' },
    requests: { enabled: false, variants: [], sizes: ['P', 'M', 'G', 'GG'], maxQuantity: 5 } },
  { id: 'calca', slug: 'calca', name: 'Calça Azure', category: 'Vestuário',
    description: 'Mais uma forma de levar o azul para a sua rotina.', badge: 'No seu ritmo',
    image: { src: '/images/store/calca.png', alt: 'Calça Azure' },
    requests: { enabled: false, variants: [], sizes: ['P', 'M', 'G', 'GG'], maxQuantity: 5 } },
  { id: 'caneca', slug: 'caneca', name: 'Caneca Azure', category: 'Acessórios',
    description: 'Da primeira partida ao último café. Um espaço para a Azure na sua mesa.', badge: 'Além do jogo',
    image: { src: '/images/store/caneca.png', alt: 'Caneca Azure' },
    requests: { enabled: false, variants: [], sizes: [], maxQuantity: 5 } },
]

export function visibleProducts() {
  return (storeSettings.preview ? previewProducts : products).filter((product) => product.visible !== false)
}

export function paymentReady() {
  return !storeSettings.preview && !!storeSettings.pix.key.trim() && !!storeSettings.pix.recipient.trim() && !!storeSettings.fulfillment.trim()
}

export function orderable(product: Product) {
  return paymentReady() && product.visible !== false && product.requests?.enabled === true &&
    Number.isSafeInteger(product.priceCents) && product.priceCents! > 0 && product.priceCents! <= 10_000_000 &&
    Number.isInteger(product.requests.maxQuantity) && product.requests.maxQuantity > 0 && product.requests.maxQuantity <= 20
}

export const money = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
