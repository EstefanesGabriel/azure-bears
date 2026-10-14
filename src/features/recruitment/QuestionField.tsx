import { useController, useFormContext } from 'react-hook-form'
import { days, periods } from './config'
import type { Question } from './config'
import type { AnswerValues } from './form'

export function QuestionField({ question }: { question: Question }) {
  const { control } = useFormContext<AnswerValues>()
  const multiple = question.kind === 'multiple' || question.kind === 'availability'
  const { field, fieldState: { error } } = useController({
    control, name: `answers.${question.id}`, defaultValue: multiple ? [] : '',
  })
  const id = `question-${question.id}`
  const describedBy = [question.hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  const common = { id, name: field.name, onBlur: field.onBlur, 'aria-invalid': !!error, 'aria-describedby': describedBy, 'aria-required': !question.optional }
  const selected = Array.isArray(field.value) ? field.value : []
  const value = typeof field.value === 'string' ? field.value : ''
  const toggle = (option: string) => field.onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option])
  const group = multiple || question.kind === 'radio'
  const label = <>{question.label}{question.optional && <> <span className="recruit-optional">Opcional</span></>}</>
  const notes = <>
    {question.hint && <p className="recruit-hint" id={`${id}-hint`}>{question.hint}</p>}
    {error && <p className="recruit-error" id={`${id}-error`}>{error.message}</p>}
  </>

  if (group) return (
    <fieldset className="recruit-field" aria-describedby={describedBy} aria-invalid={!!error}>
      <legend>{label}</legend>
      {notes}
      {question.kind === 'availability' ? (
        <table className="availability-table">
          <caption className="sr-only">Disponibilidade por dia e período</caption>
          <thead><tr><th scope="col">Dia</th>{periods.map((period) => <th scope="col" key={period}>{period}</th>)}</tr></thead>
          <tbody>{days.map((day, dayIndex) => <tr key={day}>
            <th scope="row">{day}</th>
            {periods.map((period, index) => {
              const option = `${day} — ${period}`
              return <td key={period}><label className="availability-check">
                <input type="checkbox" name={field.name} ref={dayIndex === 0 && index === 0 ? field.ref : undefined} checked={selected.includes(option)} onBlur={field.onBlur} onChange={() => toggle(option)} />
                <span className="sr-only">{option}</span>
              </label></td>
            })}
          </tr>)}</tbody>
        </table>
      ) : (
        <div className={`recruit-choices ${multiple ? 'recruit-choices-multiple' : ''}`}>
          {question.options?.map((option, index) => <label className="recruit-choice" key={option}>
            <input {...common} id={`${id}-${index}`} ref={index === 0 ? field.ref : undefined} aria-required={!multiple && !question.optional}
              type={multiple ? 'checkbox' : 'radio'} value={option}
              checked={multiple ? selected.includes(option) : value === option}
              onChange={() => multiple ? toggle(option) : field.onChange(option)} />
            <span>{option}</span>
          </label>)}
        </div>
      )}
    </fieldset>
  )

  return <div className="recruit-field">
    <label htmlFor={id}>{label}</label>
    {notes}
    {question.kind === 'select' ? (
      <select {...common} ref={field.ref} value={value} onChange={field.onChange}>
        <option value="">Selecione uma opção</option>
        {question.options?.map((option) => <option value={option} key={option}>{option}</option>)}
      </select>
    ) : question.kind === 'textarea' ? (
      <textarea {...common} ref={field.ref} value={value} onChange={field.onChange} rows={4} maxLength={4000} />
    ) : (
      <input {...common} ref={field.ref} type={question.kind ?? 'text'} value={value} onChange={field.onChange}
        autoComplete={question.autoComplete ?? 'off'} maxLength={4000} />
    )}
  </div>
}
