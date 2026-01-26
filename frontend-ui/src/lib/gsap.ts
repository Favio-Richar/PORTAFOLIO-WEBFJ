import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Default configuration
gsap.config({
    nullTargetWarn: false,
});

// Utility animations
export const fadeIn = (element: string | Element | Element[] | null, delay = 0) => {
    return gsap.fromTo(
        element,
        { opacity: 0, y: 60 },
        {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay,
            ease: "power3.out",
        }
    );
};

export const slideUp = (element: string | Element | Element[] | null, delay = 0) => {
    return gsap.fromTo(
        element,
        { opacity: 0, y: 100 },
        {
            opacity: 1,
            y: 0,
            duration: 1,
            delay,
            ease: "power4.out",
        }
    );
};

export const staggerReveal = (elements: any, stagger = 0.1) => {
    return gsap.fromTo(
        elements,
        { opacity: 0, y: 80, scale: 0.95 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger,
            ease: "back.out(1.2)",
            scrollTrigger: {
                trigger: elements,
                start: "top 85%",
                toggleActions: "play none none none",
            },
        }
    );
};


export const textReveal = (element: string | Element | null) => {
    return gsap.fromTo(
        element,
        { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
        {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            duration: 1.2,
            ease: "power4.inOut",
        }
    );
};

export const parallaxScroll = (element: string | Element | null, speed = 0.5) => {
    return gsap.to(element, {
        y: () => window.innerHeight * speed,
        ease: "none",
        scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
        },
    });
};

export { gsap, ScrollTrigger };
