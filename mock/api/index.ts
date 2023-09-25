import users from './user'
import dashboard from './dashboard'
import dept from './dept'
import chat from './instrument/chat'
import articleApis from './articles'
import task from './task'
import management from './management'

export default [...dept, ...dashboard, ...chat, ...management, ...articleApis, ...task, ...users]
