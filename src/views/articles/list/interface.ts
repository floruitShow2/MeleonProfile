export type ArticleSwiperEntity = Pick<
    ApiArticle.ArticleEntity,
    'title' | 'description' | 'cover' | 'views' | 'comments'
>

export interface SearchOption {
    category: string
}