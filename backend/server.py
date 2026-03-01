from fastapi import FastAPI, APIRouter, Depends, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import json

from database import engine, get_db, Base
from models import User, Roadmap, Problem, UserProgress, RoadmapProblem
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create tables
Base.metadata.create_all(bind=engine)

# Create the main app
app = FastAPI(title="DSA Forge API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models for API
class UserCreate(BaseModel):
    username: str
    email: str
    skill_level: str = 'beginner'

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    skill_level: str
    created_at: datetime

    class Config:
        from_attributes = True

class RoadmapGenerateRequest(BaseModel):
    user_id: str
    skill_level: str  # beginner, intermediate, advanced
    duration_weeks: int = 12
    focus_topics: Optional[List[str]] = None
    time_per_day: Optional[str] = "1-2 hours"

class RoadmapResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    skill_level: str
    duration_weeks: int
    topics: dict
    generated_at: datetime

    class Config:
        from_attributes = True

class ProblemCreate(BaseModel):
    title: str
    difficulty: str
    topic: str
    description: Optional[str] = None
    solution_link: Optional[str] = None
    tags: Optional[List[str]] = None

class ProblemResponse(BaseModel):
    id: str
    title: str
    difficulty: str
    topic: str
    description: Optional[str]
    solution_link: Optional[str]
    tags: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True

class ProgressUpdate(BaseModel):
    user_id: str
    problem_id: str
    status: str  # pending, in_progress, completed
    notes: Optional[str] = None

class ProgressResponse(BaseModel):
    id: str
    user_id: str
    problem_id: str
    status: str
    completed_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_problems: int
    completed_problems: int
    in_progress_problems: int
    pending_problems: int
    completion_rate: float
    problems_by_difficulty: dict
    problems_by_topic: dict

# AI Service for Roadmap Generation
async def generate_dsa_roadmap_ai(skill_level: str, duration_weeks: int, focus_topics: Optional[List[str]], time_per_day: str):
    """
    Generate a personalized DSA roadmap using AI
    """
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        
        focus_str = ", ".join(focus_topics) if focus_topics else "all major topics"
        
        prompt = f"""Generate a comprehensive Data Structures and Algorithms learning roadmap with the following specifications:

Skill Level: {skill_level}
Duration: {duration_weeks} weeks
Daily Time Commitment: {time_per_day}
Focus Topics: {focus_str}

Provide a structured JSON response with:
1. A roadmap title
2. A brief description
3. Week-by-week breakdown with topics to cover
4. Recommended problems for each week
5. Key concepts to master

Format the response as valid JSON with this structure:
{{
  "title": "Roadmap title",
  "description": "Brief overview",
  "weekly_plan": [
    {{
      "week": 1,
      "topics": ["topic1", "topic2"],
      "concepts": ["concept1", "concept2"],
      "problem_count": 10
    }}
  ]
}}"""
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"roadmap_{uuid.uuid4()}",
            system_message="You are an expert DSA mentor who creates personalized learning paths."
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse AI response
        try:
            # Extract JSON from response
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            roadmap_data = json.loads(response_text)
            return roadmap_data
        except json.JSONDecodeError:
            # Fallback if AI doesn't return valid JSON
            return {
                "title": f"{skill_level.title()} DSA Roadmap",
                "description": response[:200],
                "weekly_plan": [
                    {"week": i+1, "topics": ["Arrays", "Strings"], "concepts": ["Basic operations"], "problem_count": 5}
                    for i in range(duration_weeks)
                ]
            }
    except Exception as e:
        logging.error(f"AI roadmap generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate roadmap: {str(e)}")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "DSA Forge API is running!", "version": "1.0.0"}

# User endpoints
@api_router.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    new_user = User(
        id=str(uuid.uuid4()),
        username=user.username,
        email=user.email,
        skill_level=user.skill_level
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@api_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.get("/users", response_model=List[UserResponse])
async def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

# Roadmap endpoints
@api_router.post("/generate-roadmap", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapGenerateRequest, db: Session = Depends(get_db)):
    """
    Generate a personalized DSA roadmap using AI
    """
    # Verify user exists
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate roadmap using AI
    roadmap_data = await generate_dsa_roadmap_ai(
        request.skill_level,
        request.duration_weeks,
        request.focus_topics,
        request.time_per_day
    )
    
    # Create roadmap in database
    new_roadmap = Roadmap(
        id=str(uuid.uuid4()),
        user_id=request.user_id,
        title=roadmap_data.get("title", f"{request.skill_level.title()} DSA Roadmap"),
        description=roadmap_data.get("description", "AI-generated personalized roadmap"),
        skill_level=request.skill_level,
        duration_weeks=request.duration_weeks,
        topics=roadmap_data
    )
    db.add(new_roadmap)
    db.commit()
    db.refresh(new_roadmap)
    return new_roadmap

@api_router.get("/roadmaps/{roadmap_id}", response_model=RoadmapResponse)
async def get_roadmap(roadmap_id: str, db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap

@api_router.get("/users/{user_id}/roadmaps", response_model=List[RoadmapResponse])
async def get_user_roadmaps(user_id: str, db: Session = Depends(get_db)):
    roadmaps = db.query(Roadmap).filter(Roadmap.user_id == user_id).all()
    return roadmaps

# Problem endpoints
@api_router.post("/problems", response_model=ProblemResponse)
async def create_problem(problem: ProblemCreate, db: Session = Depends(get_db)):
    new_problem = Problem(
        id=str(uuid.uuid4()),
        title=problem.title,
        difficulty=problem.difficulty,
        topic=problem.topic,
        description=problem.description,
        solution_link=problem.solution_link,
        tags=problem.tags
    )
    db.add(new_problem)
    db.commit()
    db.refresh(new_problem)
    return new_problem

@api_router.get("/problems", response_model=List[ProblemResponse])
async def get_problems(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Problem)
    
    if topic:
        query = query.filter(Problem.topic == topic)
    if difficulty:
        query = query.filter(Problem.difficulty == difficulty)
    
    problems = query.all()
    return problems

@api_router.get("/problems/{problem_id}", response_model=ProblemResponse)
async def get_problem(problem_id: str, db: Session = Depends(get_db)):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

# Progress endpoints
@api_router.post("/progress", response_model=ProgressResponse)
async def update_progress(progress: ProgressUpdate, db: Session = Depends(get_db)):
    # Check if progress entry exists
    existing = db.query(UserProgress).filter(
        UserProgress.user_id == progress.user_id,
        UserProgress.problem_id == progress.problem_id
    ).first()
    
    if existing:
        # Update existing progress
        existing.status = progress.status
        existing.notes = progress.notes
        if progress.status == 'completed':
            existing.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new progress entry
        new_progress = UserProgress(
            id=str(uuid.uuid4()),
            user_id=progress.user_id,
            problem_id=progress.problem_id,
            status=progress.status,
            notes=progress.notes,
            completed_at=datetime.utcnow() if progress.status == 'completed' else None
        )
        db.add(new_progress)
        db.commit()
        db.refresh(new_progress)
        return new_progress

@api_router.get("/users/{user_id}/progress", response_model=List[ProgressResponse])
async def get_user_progress(user_id: str, db: Session = Depends(get_db)):
    progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).all()
    return progress

@api_router.get("/users/{user_id}/dashboard-stats", response_model=DashboardStats)
async def get_dashboard_stats(user_id: str, db: Session = Depends(get_db)):
    # Get all progress for user
    all_progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).all()
    
    total = len(all_progress)
    completed = len([p for p in all_progress if p.status == 'completed'])
    in_progress = len([p for p in all_progress if p.status == 'in_progress'])
    pending = len([p for p in all_progress if p.status == 'pending'])
    
    completion_rate = (completed / total * 100) if total > 0 else 0
    
    # Get problems by difficulty
    problems_by_difficulty = {}
    problems_by_topic = {}
    
    for prog in all_progress:
        problem = db.query(Problem).filter(Problem.id == prog.problem_id).first()
        if problem:
            # Count by difficulty
            if problem.difficulty not in problems_by_difficulty:
                problems_by_difficulty[problem.difficulty] = 0
            problems_by_difficulty[problem.difficulty] += 1
            
            # Count by topic
            if problem.topic not in problems_by_topic:
                problems_by_topic[problem.topic] = 0
            problems_by_topic[problem.topic] += 1
    
    return DashboardStats(
        total_problems=total,
        completed_problems=completed,
        in_progress_problems=in_progress,
        pending_problems=pending,
        completion_rate=completion_rate,
        problems_by_difficulty=problems_by_difficulty,
        problems_by_topic=problems_by_topic
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)