import { request } from '@/service'

enum URLs {
  'create' = '/api/team/createTeam',
  'getTeams' = '/api/team/getTeamsList'
}

/**
 * @description 创建团队
 * @param team 部分团队信息
 * @returns 创建好的团队ID
 */
export const CreateTeam = (data: FormData) => {
  return request.post(URLs.create, data)
}

export const FetchTeamList = () => {
  return request.get<ApiTeam.TeamEntity[]>(URLs.getTeams)
}
