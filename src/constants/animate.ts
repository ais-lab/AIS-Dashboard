import { Variants } from "framer-motion"

export const authDialogVariants: Variants = {
  offscreen: {
    opacity: 0,
    scale: 1.15,
  },
  onscreen: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.3,
      type: "spring",
      bounce: 0.3,
      duration: 0.4,
    },
  },
  outscreen: {
    opacity: 0,
    scale: 0.9,
    transition: {
      type: "spring",
      duration: 0.3,
    },
  },
}
