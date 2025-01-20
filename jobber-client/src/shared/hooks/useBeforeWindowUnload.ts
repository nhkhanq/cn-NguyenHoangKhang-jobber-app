import { useEffect } from 'react'
import { socket } from 'src/sockets/socket.service'

import { getDataFromSessionStorage } from '../utils/utils.service'

const useBeforeWindowUnload = (): void => {
  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      const loggedInUsername: string = getDataFromSessionStorage('loggedInUser')
      socket.emit('removeLoggedInUser', loggedInUsername)
    })
  }, [])
}

export default useBeforeWindowUnload