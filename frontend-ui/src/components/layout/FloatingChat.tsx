"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPaperPlane, FaRobot, FaCommentDots } from 'react-icons/fa';
import '@/styles/about-elite.scss';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'agent';
}

export default function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hola, ¿en qué podemos ayudarte? Nuestro equipo está disponible para responder tus preguntas sobre nuestros servicios.", sender: 'agent' }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const quickActions = [
        { label: "Servicios", msg: "Deseo información sobre sus servicios tecnológicos." },
        { label: "Cotización", msg: "Me gustaría solicitar una cotización para un proyecto." },
        { label: "Soporte", msg: "Necesito contacto con el área de soporte técnico." },
        { label: "Nosotros", msg: "Quisiera conocer más sobre la empresa y el equipo." }
    ];

    const handleSend = (text: string, isUser: boolean = true) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now(), text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");

        // Simulate Bot Response
        setTimeout(() => {
            const responses = [
                '👍 ¡Excelente pregunta! Nos comunicaremos contigo pronto.',
                'Gracias por tu interés. Nuestro equipo te contactará en breve.',
                'Perfecto, hemos recibido tu consulta. ¡Muy pronto tendrás respuesta!',
                'Entendido. Un especialista se comunicará contigo a la brevedad.'
            ];
            const botMsg: Message = {
                id: Date.now() + 1,
                text: responses[Math.floor(Math.random() * responses.length)],
                sender: 'agent'
            };
            setMessages(prev => [...prev, botMsg]);
        }, 800);
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
                        {/* Header */}
                        <div className="chat-header">
                            <div className="header-content">
                                <h4>¿Necesitas ayuda?</h4>
                                <p>Estamos aquí para ayudarte 24/7</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white p-1 transition-colors"
                                aria-label="Cerrar chat"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Body / Messages Area */}
                        <div className="chat-body overflow-y-auto max-h-[350px] space-y-4 no-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={msg.sender === 'agent' ? 'ai-message-container' : 'flex justify-end mb-2'}>
                                    {msg.sender === 'agent' ? (
                                        <>
                                            <div className="ai-avatar">
                                                <FaRobot className="text-white" size={16} />
                                            </div>
                                            <div className="ai-bubble">
                                                {msg.text}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-blue-600 rounded-xl p-3 max-w-[80%] text-white text-sm shadow-md">
                                            {msg.text}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />

                            {/* Quick Actions Grid - Only show if current message is from agent */}
                            <div className="chat-quick-actions mt-4">
                                {quickActions.map((action, i) => (
                                    <button
                                        key={i}
                                        className="action-btn"
                                        onClick={() => handleSend(action.msg)}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="chat-footer">
                            <form
                                className="input-wrapper"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend(inputValue);
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Escribe tu mensaje..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                                <button type="submit" className="send-icon-btn">
                                    <FaPaperPlane size={18} />
                                </button>
                            </form>
                            <div className="footer-status">
                                Responderemos lo antes posible 📧
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="chat-bubble-btn"
            >
                <FaCommentDots size={28} />
            </motion.button>
        </div>
    );
}
