import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, FileCheck2, Package, QrCode, Shirt, ShoppingBag, Upload, X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import type { Product } from '../models/content'
import { money, orderable, storeSettings, visibleProducts } from '../data/store'
import { submissionSettings } from '../data/submissions'
import { site } from '../data/site'
import { readReceipt, type PaymentReceipt } from '../features/submissions/receipt'
import { SubmissionPanel } from '../features/submissions/SubmissionPanel'
import { orderDetailsSchema } from '../features/submissions/store-schema'
import '../styles/store.css'

function ProductPhoto({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false)
  return <div className={`shop-photo shop-photo-${product.id}`}>
    {product.image && !failed ? <img src={product.image.src} alt={product.image.alt} loading="lazy" onError={() => setFailed(true)} /> :
      <div className="shop-photo-placeholder"><img src={site.symbol} alt="" /><span>FOTO EM BREVE</span></div>}
    <span className="shop-photo-index" aria-hidden="true">AZ / {product.category === 'Vestuário' ? 'WEAR' : 'LIFE'}</span>
  </div>
}

function StoreCatalog() {
  const [category, setCategory] = useState('Todos')
  const catalog = visibleProducts()
  const categories = ['Todos', ...new Set(catalog.map((product) => product.category))]
  const filtered = catalog.filter((product) => category === 'Todos' || product.category === category)
  return <div className="shop">
    <section className="shop-hero page-container" data-parallax-scene>
      <div className="shop-hero-copy" data-reveal>
        <p className="eyebrow"><span className="shop-dot" /> Azure Bears / Loja</p>
        <h1>O NOSSO AZUL.<br /><span>DO SEU JEITO.</span></h1>
        <p>O jogo termina. A identidade fica.<br />Leve a Azure para além do servidor.</p>
        <a className="button button-white" href="#catalogo">Explore a coleção <ArrowDown size={18} /></a>
      </div>
      <div className="shop-hero-art" aria-hidden="true">
        <div className="shop-orbit" /><div className="shop-orbit shop-orbit-inner" />
        <img src={site.symbol} alt="" data-parallax="18" />
        <span className="shop-sticker">FORA DO<br />SERVIDOR.</span>
        <span className="shop-art-caption">UMA COMUNIDADE. A MESMA IDENTIDADE.</span>
      </div>
    </section>
    <div className="shop-ribbon" aria-hidden="true"><span>WE ARE AZURE</span><span>✦</span><span>DO JOGO PRA VIDA</span><span>✦</span><span>WE ARE AZURE</span></div>
    <section id="catalogo" className="shop-catalog">
      <div className="page-container">
        <div className="shop-section-heading" data-reveal><div><p className="eyebrow">Escolha sua próxima companhia</p><h2>FEITO PARA<br /><span>IR COM VOCÊ.</span></h2></div><p>Nas arquibancadas. No campus.<br />Em cada novo encontro.</p></div>
        <div className="shop-toolbar"><div className="shop-filters" aria-label="Categorias de produtos">{categories.map((item) => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><span>{filtered.length} {filtered.length === 1 ? 'item' : 'itens'}</span></div>
        <div className="shop-grid">
          {filtered.map((product) => <Link className="shop-card" key={product.id} to={`/loja/${product.slug}`}>
            <div className="shop-card-visual"><ProductPhoto product={product} /><span className="shop-product-tag">{product.badge || product.category}</span><span className="shop-card-arrow"><ArrowUpRight size={22} aria-hidden="true" /></span></div>
            <div className="shop-card-caption"><div><p className="eyebrow">{product.category}</p><h3>{product.name}</h3></div><span>{product.priceCents ? money(product.priceCents) : 'Em breve'}</span></div>
            <div className="shop-card-options">{product.requests?.sizes.length ? product.requests.sizes.join(' / ') : 'Sem seleção de tamanho'}<span>Explorar <ArrowRight size={14} /></span></div>
          </Link>)}
        </div>
        {!filtered.length && <div className="shop-empty"><Package size={40} /><h3>Novidades a caminho.</h3><p>Estamos preparando os próximos produtos da Azure.</p></div>}
      </div>
    </section>
    <section className="page-container shop-how"><div data-reveal><p className="eyebrow text-accent">Da escolha ao encontro</p><h2>SEU PRÓXIMO<br />ITEM AZURE.</h2></div><ol><li><span>01</span><div><h3>Escolha seu item</h3><p>Confira os detalhes e selecione as opções disponíveis.</p></div></li><li><span>02</span><div><h3>Pix e comprovante</h3><p>Quando os pedidos abrirem, pague pelo Pix informado e anexe o comprovante por aqui.</p></div></li><li><span>03</span><div><h3>A gente se fala</h3><p>A equipe confere o pedido e combina os próximos passos com você.</p></div></li></ol></section>
  </div>
}

function PixPayment({ total }: { total: number }) {
  const [copied, setCopied] = useState('')
  const [qrFailed, setQrFailed] = useState(false)
  const pix = storeSettings.pix
  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setCopied(`${label} copiada!`) }
    catch { setCopied('Não foi possível copiar. Selecione e copie o texto abaixo.') }
  }
  return <section className="shop-payment" aria-labelledby="pix-title">
    <div className="shop-step-title"><QrCode size={22} /><h3 id="pix-title">Pague com Pix</h3></div>
    <p>Escaneie o QR Code com o aplicativo do seu banco ou copie a chave. Confira o titular e o valor antes de confirmar.</p>
    <div className="shop-pix-layout">{pix.qrImage && !qrFailed && <img className="shop-qr" src={pix.qrImage} alt="QR Code Pix da Azure Bears" onError={() => setQrFailed(true)} />}
      <div><span className="eyebrow">Valor do pedido</span><strong className="shop-payment-total">{money(total)}</strong><p>Titular: <strong>{pix.recipient}</strong></p><code>{pix.key}</code><button className="button button-white" onClick={() => void copy(pix.key, 'Chave Pix')}><Copy size={16} /> Copiar chave Pix</button>
        {pix.copyPaste && <><button className="text-link" onClick={() => void copy(pix.copyPaste, 'Código Pix')}>Copiar Pix Copia e Cola <Copy size={16} /></button><details><summary>Ver código Pix Copia e Cola</summary><code>{pix.copyPaste}</code></details></>}
      </div>
    </div><p role="status">{copied}</p><p className="shop-help">Se o QR Code não preencher o valor, informe exatamente {money(total)}. O pagamento será conferido pela equipe.</p>
  </section>
}

function ProductOrder({ product }: { product: Product }) {
  const [size, setSize] = useState('')
  const [variant, setVariant] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [contact, setContact] = useState({ fullName: '', email: '', phone: '', notes: '' })
  const [review, setReview] = useState(false)
  const [locked, setLocked] = useState(false)
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null)
  const [fileError, setFileError] = useState('')
  const [reading, setReading] = useState(false)
  const [formError, setFormError] = useState('')
  const [available, setAvailable] = useState(false)
  const [check, setCheck] = useState(0)
  const [checking, setChecking] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const fileVersion = useRef(0)
  const sizes = product.requests?.sizes ?? []
  const variants = product.requests?.variants ?? []
  const configured = orderable(product) && submissionSettings.store.enabled
  const live = configured && available
  const total = (product.priceCents ?? 0) * quantity

  useEffect(() => {
    if (!configured) return
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    setChecking(true)
    fetch('/api/forms', { signal: controller.signal, cache: 'no-store' }).then(async (response) => {
      const result = response.ok ? await response.json() as { ok?: boolean; enabled?: { store?: boolean } } : null
      if (!controller.signal.aborted) setAvailable(result?.ok === true && result.enabled?.store === true)
    }).catch(() => { setAvailable(false) }).finally(() => { clearTimeout(timer); setChecking(false) })
    return () => { controller.abort(); clearTimeout(timer) }
  }, [configured, check])

  useEffect(() => { if (review) titleRef.current?.focus() }, [review])

  async function attach(file?: File) {
    const version = ++fileVersion.current
    setReceipt(null); setFileError('')
    if (!file) { setReading(false); return }
    setReading(true)
    try { const result = await readReceipt(file); if (version === fileVersion.current) setReceipt(result) }
    catch (error) { if (version === fileVersion.current) setFileError(error instanceof Error ? error.message : 'Não foi possível ler o arquivo.') }
    finally { if (version === fileVersion.current) setReading(false) }
  }

  return <div className="shop shop-detail page-container">
    <Link className="text-link shop-back" to="/loja"><ArrowLeft size={16} /> Toda a coleção</Link>
    <div className="shop-detail-grid">
      <div className="shop-detail-visual"><ProductPhoto product={product} /><p><Shirt size={16} /> {product.badge || 'Leve a Azure com você.'}</p></div>
      <div className="shop-order">
        <p className="eyebrow text-accent">{product.category} / Azure Bears</p><h1>{product.name}</h1><p className="shop-description">{product.description}</p>
        <div className="shop-price">{product.priceCents ? money(product.priceCents) : 'Preço a definir'}{product.priceCents && <span>por unidade</span>}</div>
        <div className="shop-progress" aria-label="Etapas do pedido"><span aria-current={!review ? 'step' : undefined}>01 / Seu item</span><ArrowRight size={14} /><span aria-current={review ? 'step' : undefined}>02 / Pix e envio</span></div>
        {!review ? <form onSubmit={(event) => {
          event.preventDefault()
          const result = orderDetailsSchema.safeParse({ productId: product.id, variant, size, quantity, ...contact })
          if (!result.success) { setFormError('Confira seu nome, e-mail e celular com DDD. Preencha os campos sem deixar apenas espaços.'); return }
          setContact({ fullName: result.data.fullName, email: result.data.email, phone: result.data.phone, notes: result.data.notes })
          setFormError(''); setReview(true)
        }}>
          <fieldset className="shop-fields">
            {variants.length > 0 && <label>Variação<select required value={variant} onChange={(event) => setVariant(event.target.value)}><option value="">Escolha uma opção</option>{variants.map((item) => <option key={item}>{item}</option>)}</select></label>}
            {sizes.length > 0 && <fieldset className="shop-size-options"><legend>Seu tamanho <span>Obrigatório</span></legend>{sizes.map((item) => <label key={item}><input type="radio" name="size" value={item} checked={size === item} required onChange={() => setSize(item)} /><span>{item}</span></label>)}</fieldset>}
            <label className="shop-quantity">Quantidade<select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>{Array.from({ length: Math.min(20, product.requests?.maxQuantity || 1) }, (_, index) => <option key={index} value={index + 1}>{String(index + 1).padStart(2, '0')}</option>)}</select></label>
            <div className="shop-step-title"><ShoppingBag size={20} /><h2>Seu contato</h2></div>
            <label>Nome completo<input autoComplete="name" required maxLength={200} value={contact.fullName} onChange={(event) => setContact({ ...contact, fullName: event.target.value })} /></label>
            <div className="shop-field-pair"><label>E-mail<input type="email" autoComplete="email" required maxLength={254} value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} /></label><label>Celular com DDD<input type="tel" autoComplete="tel" required maxLength={30} value={contact.phone} onChange={(event) => { event.target.setCustomValidity(''); setContact({ ...contact, phone: event.target.value }) }} onBlur={(event) => event.target.setCustomValidity(/^[1-9]\d{9,10}$/.test(event.target.value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')) ? '' : 'Informe um celular com DDD, com 10 ou 11 dígitos.')} /></label></div>
            <label>Observações <span className="shop-optional">Opcional</span><textarea rows={3} maxLength={4000} value={contact.notes} onChange={(event) => setContact({ ...contact, notes: event.target.value })} /></label>
          </fieldset>
          {storeSettings.fulfillment && <p className="shop-fulfillment"><Package size={18} /> {storeSettings.fulfillment}</p>}
          {formError && <p role="alert" className="shop-file-error shop-help">{formError}</p>}
          <button className="button button-white shop-continue" type="submit">Revisar pedido <ArrowRight size={18} /></button>
        </form> : <div className="shop-review">
          <h2 ref={titleRef} tabIndex={-1}>Confira seu pedido</h2>
          <dl className="shop-summary"><div><dt>Produto</dt><dd>{product.name}{variant && ` · ${variant}`}{size && ` · ${size}`}</dd></div><div><dt>Quantidade</dt><dd>{quantity}</dd></div><div><dt>Contato</dt><dd>{contact.fullName}<br />{contact.email}<br />{contact.phone}</dd></div>{contact.notes && <div><dt>Observações</dt><dd>{contact.notes}</dd></div>}<div className="shop-summary-total"><dt>Total</dt><dd>{product.priceCents ? money(total) : 'A definir'}</dd></div></dl>
          <button disabled={locked} className="text-link" onClick={() => { setReview(false); setReceipt(null); setFileError('') }}><ArrowLeft size={15} /> Editar dados</button>
          {live ? <PixPayment total={total} /> : configured && <button className="text-link" disabled={checking} onClick={() => setCheck((value) => value + 1)}>{checking ? 'Verificando…' : 'Verificar disponibilidade'}</button>}
          <section className="shop-upload"><div className="shop-step-title"><Upload size={20} /><h3>Comprovante de pagamento</h3></div><p>PNG, JPG ou PDF de até 2 MB. {live && 'Anexe o comprovante para enviar seu pedido.'}</p>
            <label className={`shop-file-label ${locked ? 'is-locked' : ''}`}><input type="file" accept="image/png,image/jpeg,application/pdf" disabled={locked || reading} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; void attach(file) }} aria-label="Selecionar comprovante de pagamento" /><span>{receipt ? <FileCheck2 size={26} /> : <Upload size={26} />}<strong>{reading ? 'Lendo arquivo…' : receipt ? receipt.name : 'Selecione seu comprovante'}</strong><small>{receipt ? 'Arquivo pronto para envio' : 'Clique para escolher um arquivo'}</small></span></label>
            {receipt && <button disabled={locked} className="text-link" onClick={() => { ++fileVersion.current; setReceipt(null) }}><X size={14} /> Remover arquivo</button>}
            {fileError && <p role="alert" className="shop-file-error">{fileError}</p>}
          </section>
          {live && receipt && !reading ? <SubmissionPanel kind="store" data={{ productId: product.id, variant, size, quantity, ...contact, quotedUnitPriceCents: product.priceCents, receipt }} onLockChange={setLocked} /> : live && <div className="shop-send-pending"><Check size={18} /><p>Selecione um comprovante válido para continuar ao envio.</p></div>}
        </div>}
      </div>
    </div>
  </div>
}

export function StorePage() {
  const { slug } = useParams()
  if (!slug) return <StoreCatalog />
  const product = visibleProducts().find((item) => item.slug === slug)
  if (!product) return <section className="shop shop-detail page-container shop-empty"><Package size={42} /><h1>Produto não encontrado.</h1><p>Este item não está no catálogo atual.</p><Link className="button button-white" to="/loja">Voltar à loja <ArrowRight size={16} /></Link></section>
  return <ProductOrder product={product} key={product.id} />
}
