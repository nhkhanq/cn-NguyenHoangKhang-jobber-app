import { FC, ReactElement, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import useBeforeWindowUnload from './shared/hooks/useBeforeWindowUnload';
import AppRouter from './AppRouter'
import { socketService } from './sockets/socket.service'

const App: FC = (): ReactElement => {
  useBeforeWindowUnload()

  useEffect(() => {
    socketService.setupSocketConnection()
  }, [])

  return (
    <>
      <BrowserRouter>
        <div className="w-screen min-h-screen flex flex-col relative">
          <AppRouter />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </>
  )
}

export default App