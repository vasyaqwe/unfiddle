import { CURRENCIES } from "@unfiddle/core/currency/constants"
import {
   Select,
   SelectItem,
   SelectPopup,
   SelectTrigger,
} from "@unfiddle/ui/components/select"

export const CurrencySelect = ({
   value,
   onValueChange,
}: { value: string; onValueChange: (value: string) => void }) => {
   return (
      <Select
         value={value}
         onValueChange={onValueChange}
      >
         <SelectTrigger className="min-w-24" />
         <SelectPopup>
            {CURRENCIES.map((currency) => (
               <SelectItem
                  key={currency}
                  value={currency}
               >
                  {currency}
               </SelectItem>
            ))}
         </SelectPopup>
      </Select>
   )
}
