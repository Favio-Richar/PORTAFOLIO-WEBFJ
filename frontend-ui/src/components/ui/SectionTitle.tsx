"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface SectionTitleProps {
    title: string;
    subtitle?: string;
    badge?: string;
    align?: "left" | "center" | "right";
}

export default function SectionTitle({ title, subtitle, badge, align = "center" }: SectionTitleProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (!containerRef.current || !titleRef.current) return;

        const titleElement = titleRef.current;

        const ctx = gsap.context(() => {
            // Simple Title Reveal
            gsap.fromTo(
                titleElement,
                { opacity: 0, y: 30, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 90%",
                    },
                }
            );

            // Subtitle Reveal
            if (subtitle) {
                gsap.fromTo(
                    ".subtitle-reveal",
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        delay: 0.3,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: "top 90%",
                        },
                    }
                );
            }
        }, containerRef);

        // 3D HOVER INTERACTION (Subtle)
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = titleElement.getBoundingClientRect();
            const x = (clientX - left) / width - 0.5;
            const y = (clientY - top) / height - 0.5;

            gsap.to(titleElement, {
                rotateY: x * 20,
                rotateX: -y * 20,
                transformPerspective: 1000,
                duration: 0.4,
                ease: "power2.out",
            });
        };

        const handleMouseLeave = () => {
            gsap.to(titleElement, {
                rotateY: 0,
                rotateX: 0,
                duration: 0.8,
                ease: "power3.out",
            });
        };

        titleElement.addEventListener("mousemove", handleMouseMove);
        titleElement.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            ctx.revert();
            titleElement.removeEventListener("mousemove", handleMouseMove);
            titleElement.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [title, subtitle]);

    const alignmentClass = align === "center" ? "text-center items-center" : align === "right" ? "text-right items-end" : "text-left items-start";

    return (
        <div ref={containerRef} className={`flex flex-col mb-12 ${alignmentClass} w-full overflow-visible`}>
            {badge && (
                <span className="block text-cyan-400 text-lg font-bold tracking-[0.4em] uppercase mb-4 badge-reveal drop-shadow-sm">
                    {badge}
                </span>
            )}

            <h2
                ref={titleRef}
                className="title-fire text-5xl md:text-7xl font-bold uppercase leading-[1.1] tracking-tight drop-shadow-2xl cursor-default select-none"
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Initial text for SSR and search engines */}
                {title}
            </h2>

            {subtitle && (
                <p className="subtitle-reveal mt-6 text-white/50 text-lg md:text-xl max-w-3xl leading-relaxed font-medium">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
