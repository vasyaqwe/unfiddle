export const notify = ({
   title,
   body,
   priority,
}: { title: string; body: string; priority: "default" | "max" }) =>
   fetch("https://ntfy.sh/vasyaqwe", {
      method: "POST",
      body: `${title}\n${body}`,
      headers: {
         Priority: priority,
      },
   })
