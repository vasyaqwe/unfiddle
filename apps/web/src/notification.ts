export const notify = ({ title, body }: { title: string; body: string }) =>
   fetch("https://ntfy.sh/ledgerblocks", {
      method: "POST",
      body,
      headers: {
         Title: title,
      },
   })
