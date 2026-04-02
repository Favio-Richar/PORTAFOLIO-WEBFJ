import sqlite3
import hashlib

def check_duplicates():
    try:
        conn = sqlite3.connect('../backend-py/database.db')
        cursor = conn.cursor()
        
        # Check table structure
        cursor.execute("PRAGMA table_info(lead_communication);")
        columns = [row[1] for row in cursor.fetchall()]
        print("Columns in lead_communication:", columns)
        
        # Get all entries to find exact content duplicates
        cursor.execute("SELECT id, subject, sender, content, created_at FROM lead_communication;")
        rows = cursor.fetchall()
        
        seen = {} # (subject, sender, content_hash) -> [ids]
        duplicates = []
        
        for r in rows:
            rid, subject, sender, content, cat = r
            # Clear whitespace from content for better matching
            content_hash = hashlib.md5(str(content).strip().encode('utf-8')).hexdigest()
            key = (str(subject).strip(), str(sender).strip(), content_hash)
            
            if key in seen:
                seen[key].append(rid)
                duplicates.append(r)
            else:
                seen[key] = [rid]
        
        print(f"\nTotal messages: {len(rows)}")
        print(f"Duplicates found: {len(duplicates)}")
        
        if duplicates:
            print("\nExample duplicates (Subject, Sender):")
            for d in duplicates[:5]:
                print(f"- ID: {d[0]} | Subject: {d[1]} | From: {d[2]}")
                
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_duplicates()
