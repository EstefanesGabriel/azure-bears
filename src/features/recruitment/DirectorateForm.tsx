import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import type { FieldPath } from 'react-hook-form'
import { directorateSchema, directorateSections } from './directorate'
import type { AnswerValues } from './form'
import { QuestionField } from './QuestionField'

const steps = [...directorateSections.map(({ id, title }) => ({ id, title })), { id: 'review', title: 'Revise sua inscrição' }]

export function DirectorateForm({ onBack }: { onBack: () => void }) {
  const form = useForm<AnswerValues>({ defaultValues: { answers: {} }, shouldUnregister: false })
  const [stepIndex, setStepIndex] = useState(0)
  const [hasErrors, setHasErrors] = useState(false)
  const [review, setReview] = useState<AnswerValues | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const step = steps[stepIndex]
  const isReview = step.id === 'review'
  const isLastSection = stepIndex === directorateSections.length - 1

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
    heading.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [stepIndex])

  function goTo(index: number) {
    form.clearErrors()
    setHasErrors(false)
    setStepIndex(index)
  }

  function advance() {
    if (isReview) return
    const values = form.getValues()
    const result = directorateSchema(isLastSection ? undefined : step.id).safeParse(values)
    form.clearErrors()
    if (!result.success) {
      setHasErrors(true)
      const invalidSection = directorateSections.findIndex((section) => !directorateSchema(section.id).safeParse(values).success)
      if (invalidSection >= 0) setStepIndex(invalidSection)
      result.error.issues.forEach((issue) => {
        form.setError(issue.path.join('.') as FieldPath<AnswerValues>, { type: 'manual', message: issue.message })
      })
      const firstPath = result.error.issues[0]?.path.join('.')
      requestAnimationFrame(() => {
        if (firstPath) form.setFocus(firstPath as FieldPath<AnswerValues>)
      })
      return
    }
    if (isLastSection) setReview(result.data as AnswerValues)
    goTo(stepIndex + 1)
  }

  return (
    <FormProvider {...form}>
      <div className="recruit-workspace">
        <aside className="recruit-sidebar" aria-label="Progresso da inscrição na diretoria">
          <p className="eyebrow text-accent">Faça parte da gestão</p>
          <p className="recruit-selected-game">Diretoria Azure Bears</p>
          <p className="recruit-step-count">Etapa {stepIndex + 1} de {steps.length}</p>
          <ol className="recruit-steps">
            {steps.map((item, index) => (
              <li key={item.id} aria-current={index === stepIndex ? 'step' : undefined} className={index < stepIndex ? 'is-complete' : ''}>
                <span aria-hidden="true">{index < stepIndex ? <Check size={13} /> : String(index + 1).padStart(2, '0')}</span>
                {item.title}
              </li>
            ))}
          </ol>
          <p className="recruit-sidebar-note">Você pode voltar para conferir e editar suas respostas antes da revisão.</p>
        </aside>

        <form className="recruit-form" noValidate onSubmit={(event) => { event.preventDefault(); advance() }}>
          <div className="recruit-form-heading">
            <p className="eyebrow text-accent">Inscrição Diretoria Azure Bears</p>
            <h2 ref={heading} tabIndex={-1}>{step.title}</h2>
            {!isReview && <p>Todos os campos são obrigatórios.</p>}
          </div>
          {hasErrors && <p role="alert" className="recruit-error-summary">Confira os campos indicados para continuar.</p>}

          {!isReview && directorateSections[stepIndex].questions.map((question) => (
            <QuestionField key={question.id} question={question} />
          ))}

          {isReview && review && <>
            <div className="recruit-review-notice" role="status">
              <strong>Respostas revisadas, inscrição ainda não enviada.</strong>
              <p>O recebimento das inscrições estará disponível em breve. Esta prévia não registra sua participação no processo da diretoria.</p>
            </div>
            {directorateSections.map((section, index) => (
              <section className="recruit-review-section" key={section.id}>
                <div className="recruit-review-title">
                  <h3>{section.title}</h3>
                  <button type="button" className="text-link" onClick={() => goTo(index)}>
                    Editar<span className="sr-only"> {section.title}</span>
                  </button>
                </div>
                <dl>{section.questions.map((question) => (
                  <div key={question.id}><dt>{question.label}</dt><dd>{review.answers[question.id]}</dd></div>
                ))}</dl>
              </section>
            ))}
            <p id="directorate-submit-unavailable" className="recruit-hint">Envio indisponível nesta prévia. Nenhum dado foi enviado ou salvo.</p>
          </>}

          <div className="recruit-actions">
            <button type="button" className="recruit-back" onClick={() => stepIndex === 0 ? onBack() : goTo(stepIndex - 1)}>
              <ArrowLeft size={17} aria-hidden="true" />{stepIndex === 0 ? 'Ver opções' : 'Voltar'}
            </button>
            {isReview ? (
              <button type="button" className="button button-white" disabled aria-describedby="directorate-submit-unavailable">
                Enviar inscrição <ArrowRight size={17} aria-hidden="true" />
              </button>
            ) : (
              <button type="submit" className="button button-white">
                {isLastSection ? 'Revisar inscrição' : 'Continuar'}<ArrowRight size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
