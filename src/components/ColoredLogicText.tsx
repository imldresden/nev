import { useContext, type ReactNode } from 'react'
import { LOGIC_COLORIZATION_MODES, LogicColorizationContext } from './logicColorization'

type ColoredLogicTextProps = {
  text: string
  standaloneTerm?: boolean
  colorIndex?: number
}

const TERM_PATTERN = /(<[^>]*>|\?[A-Za-z_][A-Za-z0-9_]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_][A-Za-z0-9_]*|-?\d+(?:\.\d+)?)/g

type ArgumentFrame = {
  argumentIndex: number
  inheritedColorIndex: number | null
}

const TERM_COLORS = [
  '#8f86bf',
  '#fb8072',
  '#1f9e89',
  '#2f7fb8',
  '#d6811c',
  '#6fa632',
  '#d66aa7',
  '#7f7f7f',
  '#9b5aa3',
  '#6faa65',
  '#c7a600',
] as const

const CODE_COLORS = {
  rule: '#0000ff',
  parameter: '#008000',
  constant: '#800000',
} as const

function colorForIndex(index: number) {
  return TERM_COLORS[index % TERM_COLORS.length]
}

function isPredicateName(text: string, end: number) {
  return text.slice(end).trimStart().startsWith('(')
}

function codeColorForTerm(term: string, isRule: boolean) {
  if (isRule) {
    return CODE_COLORS.rule
  }
  if (term.startsWith('?')) {
    return CODE_COLORS.parameter
  }
  return CODE_COLORS.constant
}

function ColoredTerm({ term, colorIndex }: Readonly<{ term: string; colorIndex: number }>) {
  const mode = useContext(LogicColorizationContext)
  if (mode === LOGIC_COLORIZATION_MODES.none) {
    return term
  }

  return (
    <span
      style={{
        color: mode === LOGIC_COLORIZATION_MODES.code ? codeColorForTerm(term, false) : colorForIndex(colorIndex),
      }}
    >
      {term}
    </span>
  )
}

function ColoredCodeToken({ term, isRule }: Readonly<{ term: string; isRule: boolean }>) {
  const mode = useContext(LogicColorizationContext)
  if (mode !== LOGIC_COLORIZATION_MODES.code) {
    return term
  }

  return <span style={{ color: codeColorForTerm(term, isRule) }}>{term}</span>
}

function getCurrentArgumentColorIndex(argumentFrames: ArgumentFrame[]) {
  const frame = argumentFrames[argumentFrames.length - 1]
  return frame.inheritedColorIndex ?? frame.argumentIndex
}

export default function ColoredLogicText({
  text,
  standaloneTerm = false,
  colorIndex = 0,
}: Readonly<ColoredLogicTextProps>) {
  const mode = useContext(LogicColorizationContext)
  if (mode === LOGIC_COLORIZATION_MODES.none) {
    return <span style={{ whiteSpace: 'pre' }}>{text}</span>
  }

  if (standaloneTerm) {
    return <ColoredTerm term={text} colorIndex={colorIndex} />
  }

  const parts: ReactNode[] = []
  const argumentFrames: ArgumentFrame[] = []
  let cursor = 0

  const updateArgumentState = (syntaxText: string) => {
    for (const character of syntaxText) {
      if (character === '(') {
        argumentFrames.push({
          argumentIndex: 0,
          inheritedColorIndex: argumentFrames.length > 0 ? getCurrentArgumentColorIndex(argumentFrames) : null,
        })
      } else if (character === ',' && argumentFrames.length > 0) {
        argumentFrames[argumentFrames.length - 1].argumentIndex += 1
      } else if (character === ')') {
        argumentFrames.pop()
      }
    }
  }

  for (const match of text.matchAll(TERM_PATTERN)) {
    const start = match.index
    const end = start + match[0].length
    const precedingText = text.slice(cursor, start)

    parts.push(precedingText)
    updateArgumentState(precedingText)

    const term = match[0]
    const isRule = isPredicateName(text, end)
    const shouldColorTextTerm = argumentFrames.length > 0
    parts.push(
      mode === LOGIC_COLORIZATION_MODES.code
        ? <ColoredCodeToken key={`${start}-${term}`} term={term} isRule={isRule} />
        : shouldColorTextTerm
        ? <ColoredTerm
            key={`${start}-${term}`}
            term={term}
            colorIndex={getCurrentArgumentColorIndex(argumentFrames)}
          />
        : term
    )
    cursor = end
  }

  parts.push(text.slice(cursor))
  return <span style={{ whiteSpace: 'pre' }}>{parts}</span>
}
