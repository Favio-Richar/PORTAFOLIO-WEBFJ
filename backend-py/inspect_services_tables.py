from sqlmodel import create_engine, text
import json

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/portafolio-web"
engine = create_engine(DATABASE_URL)

target_tables = ['service', 'professionalplan', 'additionalservice', 'faq', 'teammember', 'review']

def inspect_tables():
    schema_info = {}
    with engine.connect() as conn:
        for table in target_tables:
            query = text(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table}'")
            result = conn.execute(query).fetchall()
            schema_info[table] = [{"name": row[0], "type": row[1]} for row in result]
    
    with open("services_schema.json", "w", encoding="utf-8") as f:
        json.dump(schema_info, f, indent=2)
    print("Schema info saved to services_schema.json")

if __name__ == "__main__":
    inspect_tables()
