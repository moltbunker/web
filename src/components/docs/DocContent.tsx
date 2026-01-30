import { renderMarkdown } from '@/utils/markdown.tsx'

interface DocContentProps {
  content: string
}

const DocContent = ({ content }: DocContentProps) => {
  return <div>{renderMarkdown(content)}</div>
}

export default DocContent
