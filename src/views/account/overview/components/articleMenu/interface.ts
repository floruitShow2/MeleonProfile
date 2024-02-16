export interface ArticleCategoryType {
  label: string
  code: 'total' | ApiArticle.ArticleEntity['status']
  num: number
  list: ApiArticle.ArticleEntity[]
}
