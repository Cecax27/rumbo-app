/**
 * Minimal inline-formatting parser for block text.
 *
 * Supports a deliberately small markdown subset — **bold** and _italic_.
 * No HTML is passed through ever: `<` and `>` are rendered as literal text,
 * which keeps the renderers safe from raw-HTML injection via authored content.
 */

export type InlineNode = PlainText | BoldNode | ItalicNode

export interface PlainText {
  kind: "text"
  text: string
}

export interface BoldNode {
  kind: "bold"
  children: InlineNode[]
}

export interface ItalicNode {
  kind: "italic"
  children: InlineNode[]
}

interface Token {
  type: "text" | "bold_delim" | "italic_delim"
  value: string
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = []

  // Match **bold** and _italic_ (in that order) so bold wins over italic.
  const pattern = /(\*\*|_)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(input)) !== null) {
    const index = match.index
    if (index > lastIndex) {
      tokens.push({ type: "text", value: input.slice(lastIndex, index) })
    }
    tokens.push({ type: match[0] === "**" ? "bold_delim" : "italic_delim", value: match[0] })
    lastIndex = index + match[0].length
  }

  if (lastIndex < input.length) {
    tokens.push({ type: "text", value: input.slice(lastIndex) })
  }

  return tokens
}

/**
 * Parses `input` into inline nodes. Unclosed delimiters are treated as literal
 * text so that stray `**` in authored content never breaks rendering.
 */
export function parseInline(input: string): InlineNode[] {
  const tokens = tokenize(input)
  const nodes: InlineNode[] = []
  const stack: { kind: "bold" | "italic"; children: InlineNode[] }[] = []

  for (const token of tokens) {
    if (token.type === "text") {
      if (token.value.length === 0) continue
      const node: PlainText = { kind: "text", text: token.value }
      if (stack.length > 0) {
        stack[stack.length - 1]!.children.push(node)
      } else {
        nodes.push(node)
      }
      continue
    }

    const kind: "bold" | "italic" = token.type === "bold_delim" ? "bold" : "italic"

    const openFrame = stack[stack.length - 1]
    if (openFrame && openFrame.kind === kind) {
      // Closing delimiter.
      stack.pop()
      const parent = stack[stack.length - 1]
      const closed: BoldNode | ItalicNode = { kind, children: openFrame.children }
      if (parent) {
        parent.children.push(closed)
      } else {
        nodes.push(closed)
      }
    } else {
      // Opening delimiter.
      stack.push({ kind, children: [] })
    }
  }

  // Unclosed delimiters degrade to literal text.
  for (const frame of stack) {
    const text = (frame.kind === "bold" ? "**" : "_")
    const literal: PlainText = { kind: "text", text }
    nodes.push(literal)
    nodes.push(...frame.children)
  }

  return nodes
}
