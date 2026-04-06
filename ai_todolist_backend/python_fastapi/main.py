from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, Boolean, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session


SQLALCHEMY_DATABASE_URL = "sqlite:///../node_prisma/prisma/dev.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Tarefa(Base):
    __tablename__ = "Tarefa"
    id = Column(Integer, primary_key=True)
    titulo = Column(String)
    concluida = Column(Boolean)
    usuarioId = Column(Integer)


app = FastAPI(
    title="Analisador de Tarefas",
    description="Serviço 3: Contagem e métricas de tarefas por usuário."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/estatisticas/{usuario_id}", summary="Obter métricas do usuário")
def contar_tarefas(usuario_id: int, db: Session = Depends(get_db)):
    total = db.query(Tarefa).filter(Tarefa.usuarioId == usuario_id).count()
    concluidas = db.query(Tarefa).filter(Tarefa.usuarioId == usuario_id, Tarefa.concluida == True).count()
    pendentes = total - concluidas

    return {
        "usuarioId": usuario_id,
        "total": total,
        "concluidas": concluidas,
        "pendentes": pendentes
    }