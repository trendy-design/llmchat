import { motion } from "framer-motion";

const LoadingDot = {
  display: "block",
  width: "4px",
  height: "4px",
  borderRadius: "50%",
};

const LoadingContainer = {
  width: "24px",
  height: "24px",
  paddingTop: "6px",
  display: "flex",
  justifyContent: "space-around",
};

const ContainerVariants = {
  initial: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const DotVariants = {
  initial: {
    y: "0%",
    opacity: 1,
  },
  animate: {
    y: "100%",
    opacity: 0.5,
  },
};

const DotTransition = {
  duration: 1.5,
  repeat: Infinity,
  ease: "easeInOut",
};

export default function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        style={LoadingContainer}
        variants={ContainerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.span
          style={LoadingDot}
          className="dark:bg-white/50 bg-zinc-600"
          variants={DotVariants}
          transition={DotTransition}
        />
        <motion.span
          style={LoadingDot}
          className="dark:bg-white/50 bg-zinc-600"
          variants={DotVariants}
          transition={DotTransition}
        />
        <motion.span
          style={LoadingDot}
          className="dark:bg-white/50 bg-zinc-600"
          variants={DotVariants}
          transition={DotTransition}
        />
      </motion.div>
    </div>
  );
}
