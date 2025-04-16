import { motion } from 'framer-motion';

const LoadingDot = {
    display: 'block',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
};

const LoadingContainer = {
    width: '24px',
    height: '24px',
    paddingTop: '6px',
    display: 'flex',
    justifyContent: 'space-around',
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
        y: '0%',
        opacity: 1,
    },
    animate: {
        y: '100%',
        opacity: 0.5,
    },
};

const DotTransition = {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
};

export function Spinner() {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-brand h-4 w-4 animate-spin"
        >
            <path d="M12 3v3m6.366-.366-2.12 2.12M21 12h-3m.366 6.366-2.12-2.12M12 21v-3m-6.366.366 2.12-2.12M3 12h3m-.366-6.366 2.12 2.12"></path>
        </svg>
    );
}

export function LinearSpinner() {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                    className="bg-muted-foreground"
                    variants={DotVariants}
                    transition={DotTransition}
                />
                <motion.span
                    style={LoadingDot}
                    className="bg-muted-foreground"
                    variants={DotVariants}
                    transition={DotTransition}
                />
                <motion.span
                    style={LoadingDot}
                    className="bg-muted-foreground"
                    variants={DotVariants}
                    transition={DotTransition}
                />
            </motion.div>
        </div>
    );
}
