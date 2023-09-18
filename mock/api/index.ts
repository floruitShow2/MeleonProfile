import dept from './dept'
import chat from './instrument/chat'
import article from './articles/category'
import task from './task'
import management from './management'
import dashboard from './dashboard'

export default [...dept, ...dashboard, ...chat, ...management, ...article, ...task]
