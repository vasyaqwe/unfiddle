import type { Editor } from "@tldraw/tldraw"
import { createContext, useContext, useEffect, useState } from "react"

type BoardContextType = {
   editor: Editor | null
   setEditor: (editor: Editor | null) => void
   currentUserId: string | null
}

const BoardContext = createContext<BoardContextType>({
   editor: null,
   setEditor: () => {},
   currentUserId: null,
})

export function useBoard() {
   return useContext(BoardContext)
}

export function BoardProvider({ children }: { children: React.ReactNode }) {
   const [editor, setEditor] = useState<Editor | null>(null)
   const [currentUserId, setCurrentUserId] = useState<string | null>(null)

   useEffect(() => {
      if (!editor) return

      setCurrentUserId(editor.user.getId())
   }, [editor])

   return (
      <BoardContext.Provider
         value={{
            editor: editor,
            setEditor: setEditor,
            currentUserId: currentUserId,
         }}
      >
         {children}
      </BoardContext.Provider>
   )
}
