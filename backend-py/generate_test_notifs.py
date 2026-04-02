import sys
import os

# Añadir el path del proyecto al sys.path
sys.path.append(os.getcwd())

from sqlmodel import Session
from app.db import engine
from app.models import SystemNotification

def create_test_notifications():
    with Session(engine) as session:
        notifs = [
            SystemNotification(
                title="Nueva Suscripción (Test)",
                message="usuario_prueba@example.com se ha unido al boletín.",
                type="info",
                link="/admin/subscribers"
            ),
            SystemNotification(
                title="Reserva Recibida (Test)",
                message="Juan Pérez ha reservado una asesoría para mañana.",
                type="success",
                link="/admin/bookings"
            ),
             SystemNotification(
                title="Nueva Reseña (Test)",
                message="Un invitado ha calificado con 5 estrellas.",
                type="success",
                link="/admin/reviews"
            )
        ]
        session.add_all(notifs)
        session.commit()
        print(f"Se crearon {len(notifs)} notificaciones de prueba correctamente.")

if __name__ == "__main__":
    create_test_notifications()
