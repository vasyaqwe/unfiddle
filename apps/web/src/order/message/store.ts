import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export const editingMessageIdAtom = atom<string | null>(null)
export const messageContentAtom = atomWithStorage<Record<string, string>>(
   "message_content",
   {},
)
