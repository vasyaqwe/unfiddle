export const sendNotification = async ({
   title,
   body,
   icon,
   onClick,
}: {
   title: string
   body: string
   icon?: string | null | undefined
   onClick?: () => void
}) => {
   try {
      if ("Notification" in window) {
         const notification = new Notification(title, {
            body,
            icon: icon ?? "/icon.png",
         })
         if (onClick) notification.onclick = onClick
      }
   } catch (error) {
      console.error("Failed to send notification:", error)
   }
}
