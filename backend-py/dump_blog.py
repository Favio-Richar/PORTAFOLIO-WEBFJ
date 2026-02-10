import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'app'))
from db import engine
from sqlmodel import Session, select
from models import Blog

def dump_blog():
    try:
        with Session(engine) as session:
            blogs = session.exec(select(Blog)).all()
            print(f"FOUND {len(blogs)} BLOG POSTS")
            for b in blogs:
                print(f"ID: {b.id} | TITLE: {b.title}")
                print(f"CONTENT PREVIEW: {b.content[:100]}...")
                print("-" * 20)
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    dump_blog()
