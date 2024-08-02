export const REVEAL_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, filter: "blur(1px)", y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    backgroundColor: "transparent",
    transition: {
      duration: 1,
      ease: "easeIn",
      delay: 0.1,
    },
  },
};
export const REVEAL_FAST_ANIMATION_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut", delay: 0.1 },
  },
};

const slideUpVariant = {
  initial: { y: 10, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

const zoomVariant = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut", delay: 1 },
  },
};

export { slideUpVariant, zoomVariant };
