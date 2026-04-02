"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaRobot, FaTimes, FaWhatsapp, FaCalendarCheck } from "react-icons/fa";
import { usePathname } from "next/navigation";
import Link from "next/link";
import API_BASE from "@/lib/apiBase";
import "@/styles/floating-chat.scss";

interface Message {
  id: number;
  text: string;
  sender: "user" | "agent";
  actionType?: "whatsapp" | "booking";
}

type FloatingChatProps = {
  pageContext?: string;
};

const BACKEND_URL = API_BASE;

export default function FloatingChat({ pageContext = "sitio-web" }: FloatingChatProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hola, en que podemos ayudarte? Nuestro equipo esta disponible para responder tus preguntas sobre nuestros servicios.",
      sender: "agent",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(2);

  const getNextMessageId = () => {
    const nextId = messageIdRef.current;
    messageIdRef.current += 1;
    return nextId;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const quickActions = [
    { label: "Servicios", msg: "Deseo informacion sobre sus servicios tecnologicos." },
    { label: "Cotizacion", msg: "Me gustaria solicitar una cotizacion para un proyecto." },
    { label: "Soporte", msg: "Necesito contacto con el area de soporte tecnico." },
    { label: "Nosotros", msg: "Quisiera conocer mas sobre la empresa y el equipo." },
  ];

  const resolvedPageContext = pageContext !== "sitio-web"
    ? pageContext
    : (pathname || "sitio-web").replace(/^\//, "") || "inicio";

  const handleSend = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending) return;

    // 1. Agregar mensaje del usuario a la UI
    setMessages((prev) => [...prev, { id: getNextMessageId(), text: trimmedText, sender: "user" }]);
    setInputValue("");
    setIsSending(true);

    try {
      // 2. Llamada al nuevo endpoint de IA
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedText,
          history: messages.map(m => ({
            role: m.sender === "agent" ? "assistant" : "user",
            content: m.text
          }))
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Error en la comunicacion con la IA");
      }

      // 3. Agregar respuesta de la IA (incluyendo la acción)
      setMessages((prev) => [
        ...prev,
        {
          id: getNextMessageId(),
          sender: "agent",
          text: data.response,
          actionType: (data.action === "whatsapp" || data.action === "booking") ? data.action : undefined,
        },
      ]);


    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: getNextMessageId(),
          sender: "agent",
          text: "Lo siento, tuve un problema técnico. ¿Prefieres contactarnos por WhatsApp?",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="floating-chat-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="chat-panel-elite open"
          >
            <div className="chat-header">
              <div className="header-content">
                <h4>Necesitas ayuda?</h4>
                <p>Estamos aqui para ayudarte 24/7</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 transition-colors"
                aria-label="Cerrar chat"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="chat-body overflow-y-auto max-h-[350px] space-y-4 no-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={msg.sender === "agent" ? "ai-message-container" : "flex justify-end mb-2"}>
                  {msg.sender === "agent" ? (
                    <div className="flex flex-col items-start max-w-[85%]">
                      <div className="flex items-end">
                        <div className="ai-avatar shrink-0 mb-1 mr-2">
                          <FaRobot className="text-white" size={16} />
                        </div>
                        <div className="ai-bubble bg-[#233256] text-white p-3 rounded-2xl rounded-bl-sm text-sm shadow-sm">{msg.text}</div>
                      </div>
                      {msg.actionType === "whatsapp" && (
                        <a href="https://wa.me/56971464296" target="_blank" rel="noopener noreferrer" className="ml-10 mt-2 bg-[#25D366]/20 hover:bg-[#25D366]/40 text-[#D9FFE8] transition-colors px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 border border-[#25D366]/30">
                          <FaWhatsapp size={14} /> Continuar en WhatsApp
                        </a>
                      )}
                      {msg.actionType === "booking" && (
                        <Link href="/asesoria" className="ml-10 mt-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-100 transition-colors px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 border border-cyan-400/30">
                          <FaCalendarCheck size={14} /> Agendar Asesoría
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="bg-blue-600 rounded-xl p-3 max-w-[80%] text-white text-sm shadow-md">{msg.text}</div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />

              <div className="chat-quick-actions mt-4">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className="action-btn"
                    onClick={() => void handleSend(action.msg)}
                    disabled={isSending}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="chat-footer">
              <form
                className="input-wrapper"
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSend(inputValue);
                }}
              >
                <input
                  type="text"
                  placeholder="Escribe tu mensaje..."
                  value={inputValue}
                  disabled={isSending}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button type="submit" className="send-icon-btn" disabled={isSending}>
                  <FaPaperPlane size={18} />
                </button>
              </form>
              <div className="footer-status">
                {isSending ? "Enviando mensaje..." : "Este chat envia tu mensaje a nuestro WhatsApp interno."}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="chat-bubble-btn"
        aria-label={isOpen ? "Cerrar chat WhatsApp" : "Abrir chat WhatsApp"}
      >
        <span className="chat-bubble-ring" aria-hidden />
        <FaWhatsapp size={26} />
      </motion.button>
    </div>
  );
}
