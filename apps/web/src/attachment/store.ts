import { atomWithStorage } from "jotai/utils"

export const uploadedIdsAtom = atomWithStorage<Record<string, string[]>>(
   "uploaded_ids",
   {},
)
