from sqlmodel import SQLModel
from app.db import engine, init_db
from app.models import EnterpriseProposal

init_db()
open('tables.txt', 'w').write(str(list(SQLModel.metadata.tables.keys())))
