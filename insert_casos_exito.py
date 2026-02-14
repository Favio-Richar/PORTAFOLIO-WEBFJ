import requests
import json

# URL de la API
API_URL = "http://localhost:8000/api/casos-exito"

# Casos de éxito de prueba
casos_prueba = [
    {
        "client_name": "Juan Pérez",
        "company_name": "TechCorp Global",
        "industry": "tecnología",
        "year": "2024",
        "website_url": "https://techcorp-global.com",
        "logo_url": "https://via.placeholder.com/150/0ea5e9/ffffff?text=TC",
        "description": "Desarrollamos una plataforma SaaS escalable con arquitectura cloud-native que procesa millones de transacciones diarias. Implementamos microservicios con Kubernetes, CI/CD automatizado, monitoreo con observabilidad completa, APIs RESTful y GraphQL, sistema de caché distribuido y base de datos multi-región.",
        "testimonial": "El equipo superó todas nuestras expectativas. La plataforma es robusta, escalable y fácil de mantener.",
        "services": json.dumps(["Desarrollo Full-Stack", "Cloud Computing", "DevOps & CI/CD", "Machine Learning"]),
        "timeline": json.dumps([
            {"phase": "Análisis y Diseño UX/UI", "duration": "2 semanas", "status": "completed"},
            {"phase": "Desarrollo Backend & APIs", "duration": "4 semanas", "status": "completed"},
            {"phase": "Desarrollo Frontend", "duration": "4 semanas", "status": "completed"},
            {"phase": "Testing y QA", "duration": "2 semanas", "status": "completed"},
            {"phase": "Deployment y Capacitación", "duration": "1 semana", "status": "completed"}
        ]),
        "metrics": json.dumps([
            {"label": "Eficiencia Operativa", "before": "45%", "after": "95%", "improvement": 111},
            {"label": "Tiempo de Respuesta", "before": "5 min", "after": "30 seg", "improvement": 90},
            {"label": "Satisfacción Usuario", "before": "72%", "after": "98%", "improvement": 36}
        ]),
        "results": json.dumps({"revenue": "+240%", "users": "500K+", "satisfaction": "98%"}),
        "media": json.dumps([
            {"type": "image", "url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"},
            {"type": "image", "url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"}
        ])
    },
    {
        "client_name": "María González",
        "company_name": "FinanceHub Pro",
        "industry": "finanzas",
        "year": "2023",
        "website_url": "https://financehub-pro.com",
        "logo_url": "https://via.placeholder.com/150/10b981/ffffff?text=FH",
        "description": "Desarrollamos una plataforma web bancaria de última generación que revolucionó la experiencia digital del cliente. Implementamos arquitectura de microservicios con React y Node.js, integración con APIs de pagos seguros, sistema de autenticación biométrica y dashboard analítico en tiempo real.",
        "testimonial": "Transformaron completamente nuestra operación digital. Los resultados superaron nuestras proyecciones más optimistas.",
        "services": json.dumps(["Desarrollo Web Bancario", "Arquitectura Cloud", "Seguridad Financiera", "APIs de Pago"]),
        "timeline": json.dumps([
            {"phase": "Análisis y Diseño UX/UI", "duration": "2 semanas", "status": "completed"},
            {"phase": "Desarrollo Backend & APIs", "duration": "4 semanas", "status": "completed"},
            {"phase": "Desarrollo Frontend", "duration": "4 semanas", "status": "completed"},
            {"phase": "Testing y QA", "duration": "2 semanas", "status": "completed"},
            {"phase": "Deployment y Capacitación", "duration": "1 semana", "status": "completed"}
        ]),
        "metrics": json.dumps([
            {"label": "Transacciones Diarias", "before": "10K", "after": "150K", "improvement": 1400},
            {"label": "Tiempo de Procesamiento", "before": "3 min", "after": "15 seg", "improvement": 92},
            {"label": "Satisfacción Cliente", "before": "68%", "after": "96%", "improvement": 41}
        ]),
        "results": json.dumps({"revenue": "+180%", "users": "250K+", "satisfaction": "96%"}),
        "media": json.dumps([
            {"type": "image", "url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800"},
            {"type": "image", "url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800"}
        ])
    },
    {
        "client_name": "Dr. Carlos Ramírez",
        "company_name": "HealthCare Plus",
        "industry": "salud",
        "year": "2024",
        "website_url": "https://healthcare-plus.com",
        "logo_url": "https://via.placeholder.com/150/ef4444/ffffff?text=HC",
        "description": "Creamos un sistema integral de gestión hospitalaria que digitalizó completamente las operaciones médicas. La plataforma incluye historia clínica electrónica, agendamiento inteligente de citas, telemedicina con videoconsulta HD, gestión de inventario farmacéutico y módulos de análisis predictivo.",
        "testimonial": "La plataforma mejoró drásticamente la eficiencia de nuestro hospital. Ahora podemos atender más pacientes con mejor calidad.",
        "services": json.dumps(["Telemedicina", "Historia Clínica Digital", "Cumplimiento HIPAA", "Analytics Médico"]),
        "timeline": json.dumps([
            {"phase": "Análisis y Diseño UX/UI", "duration": "2 semanas", "status": "completed"},
            {"phase": "Desarrollo Backend & APIs", "duration": "4 semanas", "status": "completed"},
            {"phase": "Desarrollo Frontend", "duration": "4 semanas", "status": "completed"},
            {"phase": "Testing y QA", "duration": "2 semanas", "status": "completed"},
            {"phase": "Deployment y Capacitación", "duration": "1 semana", "status": "completed"}
        ]),
        "metrics": json.dumps([
            {"label": "Pacientes Atendidos", "before": "200/día", "after": "500/día", "improvement": 150},
            {"label": "Tiempo de Espera", "before": "45 min", "after": "10 min", "improvement": 78},
            {"label": "Satisfacción Pacientes", "before": "75%", "after": "97%", "improvement": 29}
        ]),
        "results": json.dumps({"revenue": "+200%", "users": "100K+", "satisfaction": "97%"}),
        "media": json.dumps([
            {"type": "image", "url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"},
            {"type": "image", "url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"}
        ])
    }
]

print("🚀 Insertando casos de éxito de prueba...\n")

for i, caso in enumerate(casos_prueba, 1):
    try:
        response = requests.post(API_URL, json=caso)
        if response.status_code == 200:
            print(f"✅ Caso {i}/{len(casos_prueba)}: {caso['company_name']} - CREADO")
        else:
            print(f"❌ Caso {i}/{len(casos_prueba)}: {caso['company_name']} - ERROR: {response.status_code}")
            print(f"   Respuesta: {response.text}")
    except Exception as e:
        print(f"❌ Caso {i}/{len(casos_prueba)}: {caso['company_name']} - EXCEPCIÓN: {str(e)}")

print("\n✨ Proceso completado!")
