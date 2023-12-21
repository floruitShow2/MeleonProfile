import monitorApis from './monitor'
import dashboardApis from './dashboard'
import messageApis from './message'

export default [...monitorApis, ...dashboardApis, ...messageApis]
