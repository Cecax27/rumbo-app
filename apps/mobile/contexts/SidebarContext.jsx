import { createContext, useContext, useState, useCallback } from 'react'
import SidebarPanel from '../components/sidebar/SidebarPanel'

const SidebarContext = createContext(null)

export function useSidebar() {
  return useContext(SidebarContext)
}

export function SidebarProvider({ children }) {
  const [visible, setVisible] = useState(false)

  const open = useCallback(() => setVisible(true), [])
  const close = useCallback(() => setVisible(false), [])

  return (
    <SidebarContext.Provider value={{ open, close }}>
      {children}
      <SidebarPanel visible={visible} onClose={close} />
    </SidebarContext.Provider>
  )
}
