import { Text } from 'react-native'
import { parseInline } from '@repo/learning/markdown'

function InlineNodes({ nodes }) {
  return nodes.map((node, i) => {
    switch (node.kind) {
      case 'text':
        return <Text key={i}>{node.text}</Text>
      case 'bold':
        return (
          <Text key={i} style={{ fontWeight: '700' }}>
            <InlineNodes nodes={node.children} />
          </Text>
        )
      case 'italic':
        return (
          <Text key={i} style={{ fontStyle: 'italic' }}>
            <InlineNodes nodes={node.children} />
          </Text>
        )
      default:
        return null
    }
  })
}

export default function InlineText({ children, style }) {
  return (
    <Text style={style}>
      <InlineNodes nodes={parseInline(children)} />
    </Text>
  )
}
