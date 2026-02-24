import sys
import os
from sqlalchemy import text

# Add current dir and app dir to path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'app'))

try:
    from app.db import engine
    
    with engine.connect() as conn:
        print("--- DATABASE FIX: BLOG PUBLICATION ---")
        
        # Update is_published for all articles
        result = conn.execute(text("UPDATE blog SET is_published = 1"))
        conn.commit()
        
        print(f"SUCCESS: {result.rowcount} articles updated to is_published = True.")
        
        # Verify
        count = conn.execute(text("SELECT count(*) FROM blog WHERE is_published = 1")).scalar()
        print(f"VERIFIED: {count} articles are now published.")
            
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
