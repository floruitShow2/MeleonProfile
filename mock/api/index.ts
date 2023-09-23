import users from './user'
import dashboard from './dashboard'
import dept from './dept'
import chat from './instrument/chat'
import article from './articles/category'
import task from './task'
import management from './management'

export default [...dept, ...dashboard, ...chat, ...management, ...article, ...task, ...users]
