import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import init_db
from api import upload, repository, scan, investigation, fixes, completion, reports, github

# Initialize DB on startup
init_db()

app = FastAPI(title="Agent Phantom Backend MVP", version="1.0.0")

# Setup CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(upload.router)
app.include_router(github.router)
app.include_router(repository.router)
app.include_router(scan.router)
app.include_router(investigation.router)
app.include_router(fixes.router)
app.include_router(completion.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {"status": "Agent Phantom Backend is running"}
