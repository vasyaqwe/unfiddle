import { CURRENCIES } from "@unfiddle/core/currency/constants"
import { Button } from "@unfiddle/ui/components/button"
import {
   Select,
   SelectItem,
   SelectPopup,
   SelectTrigger,
   SelectTriggerIcon,
   SelectValue,
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
         <SelectTrigger
            render={
               <Button
                  variant="secondary"
                  className="min-w-24"
               >
                  <SelectValue />
                  <SelectTriggerIcon />
               </Button>
            }
         />
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
