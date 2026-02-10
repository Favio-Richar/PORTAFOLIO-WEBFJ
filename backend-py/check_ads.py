from sqlmodel import Session, select, func
from app.db import engine
from app.models import Ad

def check_ads():
    with Session(engine) as session:
        count = session.exec(select(func.count()).select_from(Ad)).one()
        print(f"Total Ads in DB: {count}")
        
        ads = session.exec(select(Ad)).all()
        for ad in ads:
            print(f" - {ad.title} ({ad.position}) Active: {ad.is_active}")

if __name__ == "__main__":
    check_ads()
