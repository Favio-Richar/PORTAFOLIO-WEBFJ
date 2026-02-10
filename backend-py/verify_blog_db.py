import sys
import os
from sqlalchemy import text

# Add current dir and app dir to path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'app'))

try:
    from app.db import engine
    
    with engine.connect() as conn:
        print("--- DATABASE VERIFICATION ---")
        
        # Check table
        res = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_name = 'blog'"))
        table_exists = res.fetchone()
        
        if table_exists:
            print(f"STATUS: SUCCESS - Table 'blog' exists.")
            
            # Get Columns
            cols = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'blog'"))
            print("COLUMNS:")
            for c in cols:
                print(f"  - {c[0]} ({c[1]})")
                
            # Get Count
            count = conn.execute(text("SELECT count(*) FROM blog")).scalar()
            print(f"TOTAL ARTICLES: {count}")
        else:
            print("STATUS: FAILED - Table 'blog' not found.")
            
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
