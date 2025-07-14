// import { useVirtualizer } from "@tanstack/react-virtual"
// import React from "react"

// export function SimpleVirtualList({ parentRef }) {
//    const count = 1000

//    const virtualizer = useVirtualizer({
//       count,
//       getScrollElement: () => parentRef.current,
//       estimateSize: () => 35,
//    })

//    const items = virtualizer.getVirtualItems()
//    const [, forceUpdate] = React.useState(0)

//    React.useEffect(() => {
//       forceUpdate((n) => n + 1)
//    }, [])

//    return (
//       <div
//          style={{
//             minHeight: virtualizer.getTotalSize(),
//             width: "100%",
//             position: "relative",
//          }}
//       >
//          {items.map((virtualRow) => (
//             <div
//                key={virtualRow.key}
//                ref={virtualizer.measureElement}
//                style={{
//                   position: "absolute",
//                   top: 0,
//                   left: 0,
//                   width: "100%",
//                   transform: `translateY(${virtualRow.start}px)`,
//                   borderBottom: "1px solid #ccc",
//                   boxSizing: "border-box",
//                   padding: "8px",
//                }}
//             >
//                Item #{virtualRow.index}
//             </div>
//          ))}
//       </div>
//    )
// }
