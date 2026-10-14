import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Gamepad2, ShieldCheck, Users } from 'lucide-react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type { FieldPath } from 'react-hook-form'
import { games, roles, rules } from '../features/recruitment/config'
import { activeSteps, applicationSchema, emptyValues, questionsFor, stepLabels, validateStep } from '../features/recruitment/form'
import type { FormValues, Step } from '../features/recruitment/form'
import { QuestionField } from '../features/recruitment/QuestionField'
import '../styles/recruitment.css'

export function RecruitmentPage() {
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState<Step>('game')
  const [hasErrors, setHasErrors] = useState(false)
  const [review, setReview] = useState<FormValues | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const form = useForm<FormValues>({ defaultValues: emptyValues(), shouldUnregister: false })
  const [gameId, role, selectedIntentions] = useWatch({ control: form.control, name: ['game', 'role', 'answers.intentions'] })
  const game = games.find((item) => item.id === gameId)
  const steps = activeSteps(role)
  const stepIndex = steps.indexOf(step)
  const values = { ...form.getValues(), game: gameId, role, answers: { ...form.getValues('answers'), intentions: selectedIntentions } }

  useEffect(() => {
    if (!started) return
    heading.current?.focus({ preventScroll: true })
    heading.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [step, started])

  function goTo(next: Step) {
    form.clearErrors()
    setHasErrors(false)
    setStep(next)
  }

  function clearGameAnswers() {
    const answers = { ...form.getValues('answers') }
    for (const question of game?.questions ?? []) delete answers[question.id]
    delete answers.igl
    form.setValue('answers', answers)
  }

  function advance() {
    if (step === 'review') return
    if (step === 'rules') form.setValue('acknowledged', true)
    const current = form.getValues()
    const result = step === 'final' ? applicationSchema(current).safeParse(current) : validateStep(step, current)
    form.clearErrors()
    if (!result.success) {
      setHasErrors(true)
      const firstPath = result.error.issues[0]?.path.join('.')
      const invalidStep = step === 'final' ? steps.find((item) => item !== 'review' && !validateStep(item, current).success) : step
      if (invalidStep) setStep(invalidStep)
      result.error.issues.forEach((issue) => form.setError(issue.path.join('.') as FieldPath<FormValues>, { type: 'manual', message: issue.message }))
      requestAnimationFrame(() => { if (firstPath) form.setFocus(firstPath as FieldPath<FormValues>) })
      return
    }
    if (step === 'final') setReview(result.data as FormValues)
    goTo(steps[stepIndex + 1])
  }

  return <div className="recruitment-page page-container">
    <div className="recruit-intro">
      <p className="eyebrow text-accent">Processos seletivos / Azure Bears</p>
      <h1>SEU PRÓXIMO<br /><span className="text-accent">TIME É AQUI.</span></h1>
      <p>Dentro ou fora do servidor. Encontre seu lugar na Azure e represente a UTFPR com a gente.</p>
    </div>
    <p className="recruit-preview-notice"><span aria-hidden="true" />Prévia do formulário. O envio de inscrições ainda não está disponível. Suas respostas ficam apenas nesta página e são descartadas ao sair ou recarregar.</p>

    {!started ? <section aria-label="Escolha como participar" className="recruit-paths">
      <article className="recruit-path recruit-path-competitive">
        <div className="recruit-card-top"><Gamepad2 size={30} aria-hidden="true" /><span className="eyebrow">01 / Competição</span></div>
        <h2>TIMES<br />COMPETITIVOS</h2>
        <p>Seu jogo. Seu time. Sua universidade. Participe como Player, Coach, Analista ou Manager.</p>
        <button className="button button-white" onClick={() => { setStarted(true); goTo('game') }}>Escolher meu jogo <ArrowRight size={18} aria-hidden="true" /></button>
      </article>
      <article className="recruit-path recruit-path-directors">
        <div className="recruit-card-top"><Users size={30} aria-hidden="true" /><span className="eyebrow">02 / Gestão</span></div>
        <h2>DIRETORIA</h2>
        <p>Ajude a construir a Azure além das partidas. O processo para a diretoria será disponibilizado em uma próxima etapa.</p>
        <span className="recruit-coming-soon">Em breve</span>
      </article>
    </section> : <FormProvider {...form}>
      <div className="recruit-workspace">
        <aside className="recruit-sidebar" aria-label="Progresso da inscrição">
          <p className="eyebrow text-accent">Times competitivos</p>
          {game && <p className="recruit-selected-game">{game.name}</p>}
          <p className="recruit-step-count">Etapa {stepIndex + 1} de {steps.length}</p>
          <ol className="recruit-steps">{steps.map((item, index) => <li key={item} aria-current={item === step ? 'step' : undefined} className={index < stepIndex ? 'is-complete' : ''}>
            <span aria-hidden="true">{index < stepIndex ? <Check size={13} /> : String(index + 1).padStart(2, '0')}</span>{stepLabels[item]}
          </li>)}</ol>
          <p className="recruit-sidebar-note">Você pode voltar para conferir e editar suas respostas antes da revisão.</p>
        </aside>
        <form className="recruit-form" noValidate onSubmit={(event) => { event.preventDefault(); advance() }}>
          <div className="recruit-form-heading">
            <p className="eyebrow text-accent">{step === 'details' ? game?.name : 'Seletiva competitiva'}</p>
            <h2 ref={heading} tabIndex={-1}>{stepLabels[step]}</h2>
            {['personal', 'academic', 'details', 'final'].includes(step) && <p>Todos os campos são obrigatórios, exceto os marcados como opcionais.</p>}
          </div>
          {hasErrors && <p role="alert" className="recruit-error-summary">Confira os campos indicados para continuar.</p>}

          {step === 'game' && <fieldset className="recruit-field">
            <legend>Por qual jogo você quer participar do time?</legend>
            <p className="recruit-hint">Escolha uma modalidade para começar.</p>
            <div className="recruit-games">{games.filter((item) => item.visible).map((item) => <label className="recruit-game" key={item.id}>
              <input type="radio" value={item.id} {...form.register('game', { onChange: () => { clearGameAnswers(); form.clearErrors('game') } })} aria-invalid={!!form.formState.errors.game} aria-describedby={form.formState.errors.game ? 'game-error' : undefined} />
              <span className="recruit-game-code" aria-hidden="true">{item.shortName}</span>
              <span className="recruit-game-name">{item.name}</span>
              <span className="recruit-game-check" aria-hidden="true"><Check size={15} /></span>
            </label>)}</div>
            {form.formState.errors.game && <p id="game-error" className="recruit-error">{form.formState.errors.game.message}</p>}
          </fieldset>}

          {step === 'rules' && <div className="recruit-rules">
            <ShieldCheck size={35} className="text-accent" aria-hidden="true" />
            <p>{rules}</p>
            <span>Ao continuar, você confirma que está ciente dessas condições.</span>
          </div>}

          {step === 'role' && <fieldset className="recruit-field">
            <legend>Qual função deseja desempenhar?</legend>
            <div className="recruit-choices">{roles.map((item) => <label className="recruit-choice" key={item}>
              <input type="radio" value={item} {...form.register('role', { onChange: () => { clearGameAnswers(); form.clearErrors('role') } })} aria-invalid={!!form.formState.errors.role} aria-describedby={form.formState.errors.role ? 'role-error' : undefined} /><span>{item}</span>
            </label>)}</div>
            {form.formState.errors.role && <p id="role-error" className="recruit-error">{form.formState.errors.role.message}</p>}
          </fieldset>}

          {questionsFor(step, values).map((question) => <QuestionField key={`${step}-${gameId}-${question.id}`} question={question} />)}

          {step === 'review' && review && <>
            <div className="recruit-review-notice" role="status"><strong>Respostas revisadas, inscrição ainda não enviada.</strong><p>O recebimento das inscrições estará disponível em breve. Esta prévia não reserva uma vaga nem registra sua participação.</p></div>
            <div className="recruit-review-section">
              <div className="recruit-review-title"><h3>Modalidade e função</h3><button type="button" className="text-link" onClick={() => goTo('game')}>Editar jogo</button><button type="button" className="text-link" onClick={() => goTo('role')}>Editar função</button></div>
              <dl><div><dt>Jogo</dt><dd>{game?.name}</dd></div><div><dt>Função</dt><dd>{review.role}</dd></div><div><dt>Ciência das regras</dt><dd>Sim, estou ciente.</dd></div></dl>
            </div>
            {(['personal', 'academic', ...(review.role === 'Player' ? ['details'] : []), 'final'] as Step[]).map((item) => <section className="recruit-review-section" key={item}>
              <div className="recruit-review-title"><h3>{stepLabels[item]}</h3><button type="button" className="text-link" onClick={() => goTo(item)}>Editar<span className="sr-only"> {stepLabels[item]}</span></button></div>
              <dl>{questionsFor(item, review).map((question) => {
                const answer = review.answers[question.id]
                return <div key={question.id}><dt>{question.label}</dt><dd>{Array.isArray(answer) ? (answer.length ? <ul>{answer.map((value) => <li key={value}>{value}</li>)}</ul> : 'Não informado') : answer || 'Não informado'}</dd></div>
              })}</dl>
            </section>)}
            <p id="recruit-submit-unavailable" className="recruit-hint">Envio indisponível nesta prévia. Nenhum dado foi enviado ou salvo.</p>
          </>}

          <div className="recruit-actions">
            <button type="button" className="recruit-back" onClick={() => { if (stepIndex === 0) setStarted(false); else goTo(steps[stepIndex - 1]) }}><ArrowLeft size={17} aria-hidden="true" />{stepIndex === 0 ? 'Ver opções' : 'Voltar'}</button>
            {step === 'review' ? <button type="button" className="button button-white" disabled aria-describedby="recruit-submit-unavailable">Enviar inscrição <ArrowRight size={17} aria-hidden="true" /></button> : <button type="submit" className="button button-white">{step === 'rules' ? 'Sim, estou ciente.' : step === 'final' ? 'Revisar inscrição' : 'Continuar'}<ArrowRight size={17} aria-hidden="true" /></button>}
          </div>
        </form>
      </div>
    </FormProvider>}
  </div>
}
