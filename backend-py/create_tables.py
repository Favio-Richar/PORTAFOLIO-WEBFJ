import sys
import os

# Add current directory to path so 'app' module can be found
sys.path.append(os.getcwd())

from app.db import init_db

if __name__ == "__main__":
    print("Initializing database tables...")
    try:
        init_db()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")
