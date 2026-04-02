import sqlalchemy
from datetime import datetime

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/portafolio-web"

def seed_direct():
    engine = sqlalchemy.create_engine(DATABASE_URL)
    with engine.connect() as conn:
        conn.execute(sqlalchemy.text("DELETE FROM blog"))
        conn.commit()
        print("Tabla blog limpia.")

        real_data = [
            {
                "title": "Como un sistema de reservas aumento 200% las ventas de un hotel",
                "category": "Casos de Exito",
                "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
                "content": "Caso real de implementacion de reservas online con pagos integrados y automatizacion operativa. El hotel necesitaba centralizar sus reservas, eliminar overbooking y automatizar confirmaciones. Se implemento una plataforma con calendario en tiempo real, pagos integrados via pasarela, notificaciones automaticas por email y WhatsApp, y un panel de control para el personal. Resultado: 200% de aumento en reservas directas en 90 dias, reduccion de 80% en errores manuales y ahorro de 3 horas diarias de gestion operativa."
            },
            {
                "title": "Guia completa: que sistema de facturacion conviene para una empresa en crecimiento",
                "category": "Guias Practicas",
                "image": "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1200",
                "content": "Comparativa clara entre alternativas de facturacion para crecer con orden financiero. Al escalar, muchas empresas descubren que su sistema de facturacion se convierte en un cuello de botella. Esta guia analiza las principales opciones del mercado: desde soluciones SaaS como Bsale o Factura.cl, hasta sistemas a medida. Evaluamos costo, integracion con contabilidad, cumplimiento tributario, y facilidad de uso para equipos de ventas. Incluye checklist de decision y recomendaciones por tamano de empresa."
            },
            {
                "title": "5 errores costosos en gestion de inventario y como evitarlos",
                "category": "Tips y Consejos",
                "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
                "content": "Lecciones practicas para ecommerce y retail enfocadas en reposicion y control de stock. Los errores de inventario cuestan en promedio un 12% de las ventas anuales en empresas de retail. Los 5 errores mas comunes son: no sincronizar stock entre canales de venta, hacer pedidos sin analisis de rotacion, no tener alertas de punto de reorden, mezclar stock fisico con virtual, y no auditar diferencias periodicamente. Cada uno viene con una solucion concreta e implementable."
            },
            {
                "title": "Por que un restaurante necesita un POS moderno para escalar operaciones",
                "category": "Industria",
                "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
                "content": "Integracion de caja, cocina y delivery para decisiones de negocio con datos reales. Un restaurante que opera con cuadernos, telefonos y cajas registradoras basicas pierde competitividad frente a quienes tienen sistemas integrados. Un POS moderno conecta el salon con la cocina via pantallas de produccion, integra las plataformas de delivery, registra tiempos de atencion y genera reportes de platos mas vendidos. El resultado es mas velocidad, menos errores y datos para tomar mejores decisiones cada dia."
            },
            {
                "title": "Seguridad web para empresas: controles minimos para operar sin riesgo",
                "category": "Seguridad",
                "image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
                "content": "Checklist tecnico para proteger datos y continuidad operativa en aplicaciones web. Las PyMEs son el objetivo mas frecuente de ataques ciberneticos porque suelen carecer de controles basicos. Este articulo entrega un checklist de seguridad minimo: HTTPS obligatorio, autenticacion de dos factores, politica de contrasenas, backups automaticos, control de accesos por rol, logs de actividad y actualizaciones de dependencias. Implementar estos controles reduce el riesgo de incidente en mas de un 70%."
            },
            {
                "title": "Plataforma SaaS o desarrollo a medida: decision tecnica para directores",
                "category": "Estrategia",
                "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
                "content": "Comparativa de costo, velocidad y flexibilidad para decidir la mejor ruta de producto. Elegir entre un SaaS existente y construir a medida es una de las decisiones tecnologicas mas relevantes para una empresa en crecimiento. Este analisis compara ambas rutas en tres dimensiones clave: costo total de propiedad (TCO), velocidad de implementacion y capacidad de personalizacion. Incluye un modelo de decision visual y casos de uso donde cada opcion tiene ventaja clara."
            },
            {
                "title": "Automatizacion de cobranza: como mejorar flujo de caja sin aumentar equipo",
                "category": "Tips y Consejos",
                "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200",
                "content": "Estrategias para reducir mora con recordatorios, reglas de cobro y seguimiento automatizado. El 40% de las facturas B2B se pagan con retraso en Chile. Automatizar la cobranza permite enviar recordatorios previos al vencimiento, escalar el tono del mensaje segun dias de mora, generar propuestas de pago y registrar todo el historial de contacto sin intervencion humana. Las empresas que implementan esto reducen su mora promedio de 45 a 12 dias y mejoran el flujo de caja sin contratar a nadie adicional."
            },
            {
                "title": "Ecommerce profesional: que necesita una tienda para vender de forma estable",
                "category": "Industria",
                "image": "https://images.unsplash.com/photo-1556742049-02e45308b01e?auto=format&fit=crop&q=80&w=1200",
                "content": "Base operativa para vender online con catalogo, inventario, pagos y soporte conectados. Tener una tienda online no garantiza ventas estables. El ecommerce profesional requiere: catalogo actualizado con precios y stock en tiempo real, integracion con medios de pago locales, logistica conectada con seguimiento, sistema de soporte post-venta y analitica de conversion. Este articulo desglosa cada componente y explica como conectarlos para lograr una operacion escalable y predecible mes a mes."
            }
        ]

        for data in real_data:
            sql = sqlalchemy.text("""
                INSERT INTO blog (title, content, category, author, main_image_url, is_published, created_at)
                VALUES (:title, :content, :category, :author, :main_image_url, :is_published, :created_at)
            """)
            conn.execute(sql, {
                "title": data["title"],
                "content": data["content"],
                "category": data["category"],
                "author": "Equipo Editorial",
                "main_image_url": data["image"],
                "is_published": True,
                "created_at": datetime.utcnow()
            })
        
        conn.commit()
        print(f"Sincronizados {len(real_data)} articulos con texto plano en portafolio-web.")

if __name__ == "__main__":
    seed_direct()
