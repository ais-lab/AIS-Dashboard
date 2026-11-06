export const displayItemKeys = {
  displayItems: ["displayItems"],
  all: () => [...displayItemKeys.displayItems],
  event: (fileId: string) => [...displayItemKeys.displayItems, "event", fileId],
  text: (fileId: string) => [...displayItemKeys.displayItems, "text", fileId],
} as const
