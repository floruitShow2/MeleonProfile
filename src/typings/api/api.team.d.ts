declare namespace ApiTeam {
    export interface TeamEntity {
        // 团队ID
        teamId: string
        // 团队Logo
        logo: string
        // 团队名称
        teamName: string
        // 团队介绍
        introduction: string
        // 创建人
        creator: Pick<ApiAuth.UserInfo, 'avatar' | 'username'>
        // 团队成员
        members: Pick<ApiAuth.UserInfo, 'avatar' | 'username'>[]
        // 创建时间
        createTime: string
        // 项目数
        taskCount: number
    }
}