"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type FadeInUpProps = {
  children: ReactNode;
  delay?: number;
};

export default function FadeInUp({ children, delay = 0 }: FadeInUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
