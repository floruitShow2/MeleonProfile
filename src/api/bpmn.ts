import axios from '@/shared/utils/request'
import { treeDataTranslate } from '@/utils/ApiUtils'
import { Message } from '@arco-design/web-vue'
// test 代表打包到开源项目中
const baseUrl = import.meta.env.VITE_APP_BASE_ADDRESS
const bpmnUrl = baseUrl + '/flow/bpmnDesigner/prod/api'
const dmnUrl = baseUrl + '/flow/dmnDesigner/prod/api'
const formUrl = baseUrl + '/flow/form/show'

const API = {
  /**
   * 获取人员分页
   */
  GetPersonalPagerModel: bpmnUrl + '/getPersonalPagerModel',
  /**
   * 获取所有组织树，公司+部门
   */
  GetOrgTree: bpmnUrl + '/getOrgTree',
  /**
   * 获取所有组织树，公司
   */
  GetCompanies: bpmnUrl + '/getCompanies',
  /**
   * 获取角色分页
   */
  GetRolePagerModel: bpmnUrl + '/getRolePagerModel',
  /**
   * 获取矩阵角色列表，不分页
   * roType 1为部门矩阵角色 2为公司矩阵角色
   * /getMatrixRoles/{roleType}
   */
  GetMatrixRoles: bpmnUrl + '/getMatrixRoles',

  /**
   * 获取监听器列表
   * // getListenersAndParams
   */
  GetListenersAndParams: bpmnUrl + '/getListenersAndParams',

  /**
   * 获取流程模板分页
   */
  GetModelInfoPagerModel: bpmnUrl + '/getModelInfoPagerModel',
  /**
   * 通过ModelKey获取Bpmn设计器xml
   * // /getBpmnByModelKey/{modelKey}
   */
  GetBpmnByModelKey: bpmnUrl + '/getBpmnByModelKey',
  /**
   * 获取自定义表单列表
   */
  GetCustomFormPagerModel: bpmnUrl + '/getCustomFormPagerModel',
  /**
   * 获取Dmn分页列表
   */
  GetDmnPagerModel: dmnUrl + '/modelPage',
  /**
   * 通过表单类型和code获取表单项
   * /getFormItemByFormCode/{formType}/{formCode}
   */
  GetFormItemByFormCode: formUrl + '/getFormItemByFormCode',
  /**
   * 通过节点id获取表单项列表//
   */
  GetFormItemShowsByActivityId: formUrl + '/getFormItemShowsByActivityId',
  /**
   * 保存表单权限
   */
  SaveNodeFormPermission: formUrl + '/saveOne',
  /**
   * 获取自定义标题的基础字段列表
   */
  GetProcessNameBaseInfos: bpmnUrl + '/getProcessNameBaseInfos',
  /**
   * 保存流程名称表达式
   */
  SaveProcessNameExp: bpmnUrl + '/saveProcessNameExp',
  /**
   * 保存BPMN模板数据
   */
  SaveBpmnModel: bpmnUrl + '/saveBpmnModel',
  /**
   * 获取三方平台类型
   */
  GetPlatformType: bpmnUrl + '/getPlatformType',
  /**
   * 通过组织id获取角色变量// /{orgId}
   */
  GetRoleVariablesByOrgId: bpmnUrl + '/getRoleVariablesByOrgId',
  /**
   * 获取表单变量/{formCode}
   */
  GetFormVariablesByCode: bpmnUrl + '/getFormVariablesByCode',
  /**
   * 获取公司矩阵角色变量
   */
  GetMatrixCompanyVariables: bpmnUrl + '/getMatrixCompanyVariables',
  /**
   * 获取部门矩阵角色变量
   */
  GetMatrixDeptVariables: bpmnUrl + '/getMatrixDeptVariables',
  /**
   * 部门变量
   */
  GetDeptVariables: bpmnUrl + '/getDeptVariables',
  /**
   * 基础变量
   */
  GetBaseVariables: bpmnUrl + '/getBaseVariables',
  /**
   * 公司变量
   */
  GetCompanyVariables: bpmnUrl + '/getCompanyVariables',
  /**
   * 人员变量
   */
  GetPersonalVariables: bpmnUrl + '/getPersonalVariables',
  /**
   * 获取分类树
   */
  GetCategories: bpmnUrl + '/getCategories',
  /**
   * 获取函数的变量列表
   */
  GetFunctionVariableVos: bpmnUrl + '/getFunctionVariableVos',
  /**
   * 获取线的基础变量列表
   */
  GetSequenceFlowVariableVos: bpmnUrl + '/getSequenceFlowVariableVos'
}

/**
 * 获取人员数据分页
 * @param params
 * @returns {Promise<AxiosResponse<any> | never>}
 */
export const getPersonalPagerModel = (params) => {
  return axios({
    method: 'POST',
    url: API.GetPersonalPagerModel,
    data: { query: params.pager, entity: params.entity }
  })
    .then((res) => {
      const { rows } = res.data
      if (rows) {
        res.data.rows = rows.map((item) => {
          return {
            id: item.id,
            name: item.name,
            code: item.code,
            sex: item.sex,
            mobile: item.mobile,
            email: item.email,
            headImg: item.headImg,
            companyId: item.companyId,
            companyName: item.companyName,
            deptId: item.deptId,
            deptName: item.deptName,
            value: genCuelEmpsMultiVariableStr(item.code)
          }
        })
      }
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

/**
 * 获取组织（公司+部门）数据 - 树形数据
 * @returns {Promise<AxiosResponse<any> | never>}
 */
export const getOrgTree = async (): Promise<any[]> => {
  try {
    const res = await axios({
      method: 'GET',
      url: API.GetOrgTree
    })
    const treeData = treeDataTranslate(res.data, 'id', 'pid')
    return Promise.resolve(treeData)
  } catch (e) {
    console.error(e)
    return Promise.reject(e)
  }
}

/**
 * 获取组织（公司）数据 - 树形数据
 * @returns {Promise<AxiosResponse<any> | never>}
 */
export const getCompanies = () => {
  return axios({
    method: 'POST',
    url: API.GetCompanies,
    data: {}
  })
    .then((res) => {
      const treeData = treeDataTranslate(res.data, 'id', 'pid')
      return Promise.resolve(treeData)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

/**
 * 获取角色分页数据
 * @param params
 * @returns {Promise<AxiosResponse<any> | never>}
 */
export const getRolePagerModel = (params) => {
  return axios({
    method: 'POST',
    url: API.GetRolePagerModel,
    data: { query: params.pager, entity: params.entity }
  })
    .then((res) => {
      const { rows } = res.data
      if (rows) {
        res.data.rows = rows.map((item) => {
          return {
            id: item.id,
            name: item.name,
            sn: item.sn,
            companyId: item.companyId,
            companyName: item.companyName
          }
        })
      }
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}
/**
 * 获取矩阵角色列表
 * @param params
 * @returns {Promise<AxiosResponse<any> | never>}
 */
export const getMatrixRoles = (params) => {
  return axios({
    method: 'POST',
    url: API.GetMatrixRoles + '/' + params.roleType
  })
}

/**
 * 根据条件获取监听列表
 * @param params
 * @returns {Promise<AxiosResponse<any> | never>}
 */
export const getListenersAndParams = (params) => {
  return axios({
    method: 'POST',
    url: API.GetListenersAndParams,
    data: params
  })
    .then((res) => {
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}
/**
 * 获取决策引擎模板数据分页
 * @param params
 * @returns {Promise<AxiosResponse<any> | never>}
 */
export const getDmnPagerModel = (params) => {
  return axios({
    method: 'POST',
    url: API.GetDmnPagerModel,
    data: { query: params.pager, entity: params.entity }
  })
    .then((res) => {
      const { rows } = res.data
      if (rows) {
        res.data.rows = rows.map((item) => {
          return {
            id: item.id,
            modelId: item.modelId,
            modelKey: item.modelKey,
            name: item.name,
            appSn: item.appSn,
            appName: item.appName,
            categoryCode: item.categoryCode,
            categoryName: item.categoryName,
            status: item.status,
            statusName: item.statusName,
            modelXml: item.modelEditorXml
          }
        })
      }
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

/**
 * 获取流程模板数据分页
 * @param params
 * @returns {Promise<AxiosResponse<any> | never>}
 */
export const getModelInfoPagerModel = (params) => {
  return axios({
    method: 'POST',
    url: API.GetModelInfoPagerModel,
    data: { query: params.pager, entity: params.entity }
  })
    .then((res) => {
      res.data = res.data || {}
      const { rows = [] } = res.data
      if (rows) {
        res.data.rows = rows.map((item) => {
          return {
            id: item.id,
            modelId: item.modelId,
            modelKey: item.modelKey,
            name: item.name,
            appSn: item.appSn,
            appName: item.appName,
            categoryCode: item.categoryCode,
            categoryName: item.categoryName,
            status: item.status,
            statusName: item.statusName
          }
        })
      }
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

/**
 * 通过ModelKey获取Bpmn设计器xml
 * @param params
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getBpmnByModelKey = (params) => {
  return axios({
    method: 'GET',
    url: API.GetBpmnByModelKey + '/' + params.modelKey
  })
}

/**
 * 获取表单模板数据分页
 * @param params
 * @returns {Promise<AxiosResponse<any> | never>}
 */
export const getCustomFormPagerModel = (params) => {
  return axios({
    method: 'POST',
    url: API.GetCustomFormPagerModel,
    data: { query: params.pager, entity: params.entity }
  })
    .then((res) => {
      const { rows = [] } = res.data
      if (rows && rows.length > 0) {
        res.data.rows = rows.map((item) => {
          return {
            id: item.id,
            code: item.code,
            name: item.name,
            title: item.title,
            categoryCode: item.categoryCode,
            categoryName: item.categoryName
          }
        })
      } else {
        res.data['rows'] = []
        res.data['total'] = 0
      }
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

// 通过流程编码，任务ID获取已设置的表单项列表
export const getFormItemShowsByActivityId = (params) => {
  return axios({
    method: 'POST',
    url: API.GetFormItemShowsByActivityId,
    data: params
  })
}

// 通过流程编码获取表单项列表
export const getFormItemByFormCode = (params) => {
  return axios({
    method: 'GET',
    url: API.GetFormItemByFormCode + '/' + params.formType + '/' + params.formCode
  })
    .then((res) => {
      if (res.data) {
        res.data.forEach((item) => {
          item.key = item.code
          item.operateType = 1
        })
      }
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

// 保存节点上的表单权限
export const saveNodeFormPermission = (params) => {
  return axios({
    method: 'POST',
    url: API.SaveNodeFormPermission,
    data: params
  })
    .then((res: any) => {
      // res.data.forEach(item=>{
      //   item.key = item.code;
      // });
      if (res.success) {
        Message.success('保存成功')
      }
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}
/**
 * 保存流程表达式
 * @param params
 * @returns {Promise<AxiosResponse<any> | never>}
 */
export const saveProcessNameExp = (params) => {
  return axios({
    method: 'POST',
    url: API.SaveProcessNameExp,
    data: params
  })
}

/**
 * 获取流程标题的基础字段列表
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getProcessNameBaseInfos = () => {
  return axios({
    method: 'GET',
    url: API.GetProcessNameBaseInfos
  })
}

/**
 * 保存BPMN模板数据
 * @param params
 * @returns {Promise<AxiosResponse<any> | never>}
 */
export const saveBpmnModel = (params) => {
  return axios({
    method: 'POST',
    url: API.SaveBpmnModel,
    data: params
  })
    .then((res) => {
      return Promise.resolve(res)
    })
    .catch(() => {
      return Promise.reject('服务器异常，请稍后再试！')
    })
}

/**
 * 获取三方平台类型
 */
export const getPlatformType = () => {
  return axios({
    method: 'GET',
    url: API.GetPlatformType
  })
}

/**
 * 获取角色变量列表
 * @param params
 */
export const getRoleVariablesByOrgId = (params) => {
  // params.flag : one/multi
  return axios({
    method: 'GET',
    url: API.GetRoleVariablesByOrgId + '/' + params.orgId + '/' + params.flag
  })
    .then((res) => {
      res.data.forEach((item) => {
        item.key = item.code
        item.roles = item.variableVos
        if (item.roles && item.roles.length > 0) {
          item.roles.forEach((itm) => {
            itm.id = itm.prefix + '.' + itm.code
            itm.value =
              params.flag === 'one'
                ? genFuelOneVariableStr(itm.id)
                : genFuelMultiVariableStr(itm.id)
          })
        }
      })
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

// 流程变量 ######################################################
/**
 * 获取表单变量列表
 * @param params
 */
export const getFormVariablesByCode = (params) => {
  return axios({
    method: 'GET',
    url: API.GetFormVariablesByCode + '/' + params.formCode
  })
    .then((res) => {
      res.data.forEach((item) => {
        item.id = item.prefix + '.' + item.code
        item.value = genVariableStr(item.id)
      })
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

// 矩阵部门角色
export const getMatrixDeptVariables = (params) => {
  return axios({
    method: 'GET',
    url: API.GetMatrixDeptVariables
  })
    .then((res) => {
      res.data.forEach((item) => {
        item.id = item.prefix + '.' + item.code
        item.value =
          params.flag === 'one'
            ? genMatrixDeptOneVariableStr(item.id)
            : genMatrixDeptVariableStr(item.id)
        item.function = params.flag === 'one' ? item.function : 'fuel.multi'
      })
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

// 矩阵公司角色
export const getMatrixCompanyVariables = (params) => {
  return axios({
    method: 'GET',
    url: API.GetMatrixCompanyVariables
  })
    .then((res) => {
      if (res.data) {
        res.data.forEach((item) => {
          item.id = item.prefix + '.' + item.code
          item.value =
            params.flag === 'one'
              ? genMatrixCompanyOneVariableStr(item.id)
              : genMatrixCompanyVariableStr(item.id)
          item.function = params.flag === 'one' ? item.function : 'fuel.multi'
        })
      }
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

export const getBaseVariables = () => {
  return axios({
    method: 'GET',
    url: API.GetBaseVariables
  })
    .then((res) => {
      if (res.data) {
        res.data.forEach((item) => {
          if (item.prefix) {
            item.id = item.prefix + '.' + item.code
            item.value = genVariableStr(item.id)
          } else {
            item.id = item.code
            item.value = genVariableStr(item.code)
          }
        })
      }
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

export const getCompanyVariables = () => {
  return axios({
    method: 'GET',
    url: API.GetCompanyVariables
  })
    .then((res) => {
      if (res.data) {
        res.data.forEach((item) => {
          item.id = item.prefix + '.' + item.code
          item.value = genVariableStr(item.id)
        })
      }
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

export const getDeptVariables = () => {
  return axios({
    method: 'GET',
    url: API.GetDeptVariables
  })
    .then((res) => {
      if (res.data) {
        res.data.forEach((item) => {
          item.id = item.prefix + '.' + item.code
          item.value = genVariableStr(item.id)
        })
      }
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

export const getSequenceFlowVariableVos = () => {
  return axios({
    method: 'GET',
    url: API.GetSequenceFlowVariableVos
  })
    .then((res) => {
      if (res.data) {
        res.data.forEach((item) => {
          item.id = item.prefix + '.' + item.code
          item.value = genVariableStr(item.id)
        })
      }
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

export const getFunctionVariableVos = () => {
  return axios({
    method: 'GET',
    url: API.GetFunctionVariableVos
  })
    .then((res) => {
      if (res.data) {
        res.data.forEach((item) => {
          item.id = item.code
          item.value = genVariableStr(item.id)
        })
      }
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

export const getPersonalVariables = () => {
  return axios({
    method: 'GET',
    url: API.GetPersonalVariables
  })
    .then((res) => {
      if (res.data) {
        res.data.forEach((item) => {
          item.id = item.prefix + '.' + item.code
          item.value = genVariableStr(item.id)
        })
      }
      return Promise.resolve(res)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

/**
 * 通过ModelKey获取Bpmn设计器xml
 * @param params
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getCategories = (params = {}) => {
  return axios({
    method: 'POST',
    url: API.GetCategories,
    data: { ...params }
  })
    .then((res) => {
      const treeData = treeDataTranslate(res.data, 'id', 'pid')
      return Promise.resolve(treeData)
    })
    .catch((e) => {
      return Promise.reject(e)
    })
}

// ${cuel.toList('10000','10001','10002')}
export const genCuelEmpsMultiVariableStr = (value) => {
  return '${cuel.toList(' + value + ')}'
}

// ${fuel.one(bz)}
export const genFuelOneVariableStr = (value) => {
  return '${fuel.one(' + value + ')}'
}
// ${fuel.multi(bz,zjl)}
export const genFuelMultiVariableStr = (value) => {
  return '${fuel.multi(' + value + ')}'
}

const genVariableStr = (value) => {
  return '${' + value + '}'
}

const genMatrixCompanyVariableStr = (value) => {
  // return '${muel.cmulti(ucompany.companyId,' + value + ')}';
  return '${fuel.multi(' + value + ')}'
}
const genMatrixCompanyOneVariableStr = (value) => {
  // return '${muel.cone(ucompany.companyId,' + value + ')}';
  return '${fuel.one(' + value + ')}'
}
const genMatrixDeptVariableStr = (value) => {
  // return '${muel.dmulti(udept.deptId,' + value + ')}';
  return '${fuel.multi(' + value + ')}'
}
const genMatrixDeptOneVariableStr = (value) => {
  // return '${muel.done(udept.deptId,' + value + ')}';
  return '${fuel.one(' + value + ')}'
}
