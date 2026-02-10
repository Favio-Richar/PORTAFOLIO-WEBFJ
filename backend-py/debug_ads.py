import sys
import os
sys.path.append(os.getcwd())

from sqlmodel import Session, select
from app.db import engine
from app.models import Ad

def check_ads():
    with Session(engine) as session:
        ads = session.exec(select(Ad)).all()
        print(f"Total Ads: {len(ads)}")
        for ad in ads:
            print(f"ID: {ad.id} | Title: {ad.title} | Position: {ad.position} | Active: {ad.is_active} | URL: {ad.image_url[:50]}...")

if __name__ == "__main__":
    check_ads()
