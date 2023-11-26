declare module 'markdown-it-toc-and-anchor' {
  import MarkdownIt from 'markdown-it/lib'

  export interface TocAndAnchorOptions {
    toc?: boolean
    tocFirstLevel?: number
    tocLastLevel?: number
    anchorLink?: boolean
  }

  export default function markdownItTocAndAnchor(
    md: MarkdownIt,
    options?: TocAndAnchorOptions
  ): void
}
