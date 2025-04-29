| Manager | Name       | Quantity | Comments                  | Quant. (Buying) | Buyer   | Sale Price | Purchase Price | Status (is the good bought from us?)  | Profit | Is the good bought by us? 
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------
| Vasa    | Tornado T5 | 795      | Item is being prepared    | 795             | Berezko | 1400       | 1300           | Successful     | 79500  | Purchased
| Vasa    | Tornado T5 | 455      | Payment for item received | 455             | Berezko | 1400       | 1350           | Successful     | 22750  | Purchased
| Vito    | Tornado T1 | 795      | Payment for item ready    | 795             | Berezko | 1400       | 1300           | Successful     | 79500  | Purchased
| Vito    | Tornado T1 | 455      | Payment for item received | 455             | Berezko | 1400       | 1350           | Successful     | 22750  | Purchased
| Vito    | Tornado T1 | 550      | Price not agreed          | -               | -       | -          | -              | Price not good | 0      | Canceled
| Vito    | Tornado T1 | 100      | Sold for 2450             | 100             | Toporov | 2450       | 2350           | Successful     | 10000  | Purchased

Now — your idea about UI improvement:

Absolutely brilliant. You're trying to solve two problems:

    Mixing two types of users (sales manager vs buyer) in the same row.

    Wanting to allow multiple buyer actions on a single sale request.

So here’s how you can restructure it: