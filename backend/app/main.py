from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.execution_service import run_mock_playwright_execution
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi.responses import StreamingResponse
from fastapi.responses import FileResponse

import os
import logging
import io
import csv

from app.database import Base, engine, SessionLocal

from app.models import (
    User,
    GeneratedTestCase,
    GeneratedAutomationScript,
    Project,
    ActivityLog,
    ExecutionLog,
)

from app.schemas import (
    RegisterRequest,
    LoginRequest,
    TestCaseRequest,
    AutomationRequest,
    SaveTestCaseRequest,
    SaveAutomationRequest,
    ProjectRequest,
)

from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
)

from app.ai_service import (
    generate_test_cases,
    generate_automation_script,
)

from app.jira_service import get_jira_user_stories
from app.azure_service import get_azure_user_stories
from app.logging_middleware import RequestLoggingMiddleware
from app.rate_limiter import RateLimitMiddleware


app = FastAPI(title="TestPilot AI")

# attach request logging middleware early so all requests are logged
app.add_middleware(RequestLoggingMiddleware)

# attach rate limiting middleware for auth endpoints
app.add_middleware(RateLimitMiddleware)

# Configure allowed CORS origins from environment to avoid localhost entries in production
allowed = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else []
# trim whitespace and filter empty
allowed = [o.strip() for o in allowed if o.strip()]
if not allowed:
    # fallback to a production frontend domain if not provided
    prod_frontend = os.getenv("FRONTEND_URL", "https://ai-v2-omega.vercel.app")
    allowed = [prod_frontend]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("testpilot")

# Log whether DATABASE_URL is configured (do not log raw URL)
logger.info(f"DATABASE_URL configured: {'yes' if os.getenv('DATABASE_URL') else 'no'}")

# request logger
request_logger = logging.getLogger("request")
request_logger.setLevel(logging.INFO)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def add_activity(db: Session, action: str, details: str):
    log = ActivityLog(action=action, details=details)
    db.add(log)
    db.commit()


@app.get("/")
def home():
    return {"message": "TestPilot AI backend running"}


@app.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # normalize and validate inputs
    email = request.email.strip().lower()
    logger.info("Registration attempt for email: %s", email)

    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=request.name,
        email=email,
        password=hash_password(request.password)
    )

    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        logger.warning("IntegrityError during registration for %s", request.email)
        raise HTTPException(status_code=400, detail="Email already registered")
    except Exception as e:
        db.rollback()
        logger.exception("Unexpected error during registration for %s: %s", request.email, str(e))
        raise HTTPException(status_code=500, detail="Internal server error")

    try:
        add_activity(
            db,
            "User Registered",
            f"Registered user: {new_user.email}"
        )
    except Exception:
        # don't fail registration if activity logging fails
        logger.exception("Failed to add activity log for registration: %s", new_user.email)

    return {"message": "User registered successfully"}


@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "name": user.name,
        "email": user.email
    }


@app.get("/jira/user-stories")
def jira_user_stories():
    try:
        stories = get_jira_user_stories()
        return {"stories": stories}
    except Exception as e:
        print(f"Error in jira_user_stories: {str(e)}")
        return {"stories": [], "error": str(e)}


@app.get("/azure/user-stories")
def azure_user_stories():
    try:
        stories = get_azure_user_stories()
        return {"stories": stories}
    except Exception as e:
        print(f"Error in azure_user_stories: {str(e)}")
        return {"stories": [], "error": str(e)}


@app.post("/generate-test-cases")
def generate_cases(request: TestCaseRequest):
    result = generate_test_cases(request.user_story)
    return {"test_cases": result}


@app.post("/generate-automation")
def generate_automation(request: AutomationRequest):
    script = generate_automation_script(
        request.user_story,
        request.framework
    )

    return {"automation_script": script}


@app.post("/save-test-cases")
def save_test_cases(
    request: SaveTestCaseRequest,
    db: Session = Depends(get_db)
):
    saved = GeneratedTestCase(
        user_story=request.user_story,
        test_cases=request.test_cases,
        project_id=request.project_id
    )

    db.add(saved)
    db.commit()
    db.refresh(saved)

    add_activity(
        db,
        "Test Case Saved",
        f"Saved test case ID {saved.id} for project ID: {request.project_id}"
    )

    return {
        "message": "Test cases saved successfully",
        "id": saved.id
    }


@app.post("/save-automation-script")
def save_automation_script(
    request: SaveAutomationRequest,
    db: Session = Depends(get_db)
):
    saved = GeneratedAutomationScript(
        user_story=request.user_story,
        framework=request.framework,
        automation_script=request.automation_script,
        project_id=request.project_id
    )

    db.add(saved)
    db.commit()
    db.refresh(saved)

    add_activity(
        db,
        "Automation Script Saved",
        f"Saved automation script ID {saved.id} for project ID: {request.project_id}"
    )

    return {
        "message": "Automation script saved successfully",
        "id": saved.id
    }


@app.get("/saved-test-cases")
def get_saved_test_cases(db: Session = Depends(get_db)):
    records = db.query(GeneratedTestCase).order_by(
        GeneratedTestCase.id.desc()
    ).all()

    return {
        "test_cases": [
            {
                "id": item.id,
                "project_id": item.project_id,
                "user_story": item.user_story,
                "test_cases": item.test_cases
            }
            for item in records
        ]
    }


@app.get("/saved-automation-scripts")
def get_saved_automation_scripts(db: Session = Depends(get_db)):
    records = db.query(GeneratedAutomationScript).order_by(
        GeneratedAutomationScript.id.desc()
    ).all()

    return {
        "automation_scripts": [
            {
                "id": item.id,
                "project_id": item.project_id,
                "user_story": item.user_story,
                "framework": item.framework,
                "automation_script": item.automation_script,
                "execution_status": item.execution_status,
                "execution_result": item.execution_result
            }
            for item in records
        ]
    }


@app.delete("/saved-test-cases/{item_id}")
def delete_test_case(item_id: int, db: Session = Depends(get_db)):
    item = db.query(GeneratedTestCase).filter(
        GeneratedTestCase.id == item_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Test case not found")

    db.delete(item)
    db.commit()

    add_activity(
        db,
        "Test Case Deleted",
        f"Deleted test case ID: {item_id}"
    )

    return {"message": "Test case deleted successfully"}


@app.delete("/saved-automation-scripts/{item_id}")
def delete_automation(item_id: int, db: Session = Depends(get_db)):
    item = db.query(GeneratedAutomationScript).filter(
        GeneratedAutomationScript.id == item_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Automation script not found")

    db.delete(item)
    db.commit()

    add_activity(
        db,
        "Automation Script Deleted",
        f"Deleted automation script ID: {item_id}"
    )

    return {"message": "Automation script deleted successfully"}


@app.post("/projects")
def create_project(request: ProjectRequest, db: Session = Depends(get_db)):
    project = Project(
        name=request.name,
        description=request.description
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    add_activity(
        db,
        "Project Created",
        f"Created project: {project.name}"
    )

    return {
        "message": "Project created successfully",
        "id": project.id
    }


@app.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.id.desc()).all()

    return {
        "projects": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description
            }
            for p in projects
        ]
    }


@app.get("/projects/{project_id}")
def get_project_by_id(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description
    }


@app.put("/projects/{project_id}")
def update_project(
    project_id: int,
    request: ProjectRequest,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.name = request.name
    project.description = request.description

    db.commit()
    db.refresh(project)

    add_activity(
        db,
        "Project Updated",
        f"Updated project: {project.name}"
    )

    return {
        "message": "Project updated successfully",
        "id": project.id,
        "name": project.name,
        "description": project.description
    }


@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project_name = project.name

    db.delete(project)
    db.commit()

    add_activity(
        db,
        "Project Deleted",
        f"Deleted project: {project_name}"
    )

    return {"message": "Project deleted successfully"}


@app.get("/projects/{project_id}/test-cases")
def get_project_test_cases(
    project_id: int,
    db: Session = Depends(get_db)
):
    records = db.query(GeneratedTestCase).filter(
        GeneratedTestCase.project_id == project_id
    ).order_by(GeneratedTestCase.id.desc()).all()

    return {
        "test_cases": [
            {
                "id": item.id,
                "project_id": item.project_id,
                "user_story": item.user_story,
                "test_cases": item.test_cases
            }
            for item in records
        ]
    }


@app.get("/projects/{project_id}/automation-scripts")
def get_project_automation_scripts(
    project_id: int,
    db: Session = Depends(get_db)
):
    records = db.query(GeneratedAutomationScript).filter(
        GeneratedAutomationScript.project_id == project_id
    ).order_by(GeneratedAutomationScript.id.desc()).all()

    return {
        "automation_scripts": [
            {
                "id": item.id,
                "project_id": item.project_id,
                "user_story": item.user_story,
                "framework": item.framework,
                "automation_script": item.automation_script,
                "execution_status": item.execution_status,
                "execution_result": item.execution_result
            }
            for item in records
        ]
    }


@app.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    total_projects = db.query(Project).count()
    total_test_cases = db.query(GeneratedTestCase).count()
    total_scripts = db.query(GeneratedAutomationScript).count()
    total_executions = db.query(ExecutionLog).count()

    return {
        "total_projects": total_projects,
        "total_test_cases": total_test_cases,
        "total_scripts": total_scripts,
        "total_executions": total_executions,
        "system_status": "Active"
    }


@app.get("/activity-logs")
def get_activity_logs(db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).order_by(
        ActivityLog.id.desc()
    ).limit(10).all()

    return {
        "logs": [
                {
                    "id": log.id,
                    "action": log.action,
                    "details": log.details,
                "created_at": log.created_at
                }
            for log in logs
        ]
    }

@app.get("/export/test-cases")
def export_test_cases(db: Session = Depends(get_db)):
    records = db.query(GeneratedTestCase).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["ID", "Project ID", "User Story", "Test Cases"])

    for item in records:
        writer.writerow([
            item.id,
            item.project_id,
            item.user_story,
            item.test_cases
        ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=test_cases.csv"
        }
    )

@app.get("/export/automation-scripts")
def export_automation_scripts(db: Session = Depends(get_db)):
    records = db.query(GeneratedAutomationScript).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "ID",
        "Project ID",
        "Framework",
        "User Story",
        "Automation Script"
    ])

    for item in records:
        writer.writerow([
            item.id,
            item.project_id,
            item.framework,
            item.user_story,
            item.automation_script
        ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=automation_scripts.csv"
        }
    )

@app.get("/execution-logs/{script_id}")
def get_execution_logs(script_id: int, db: Session = Depends(get_db)):
    logs = db.query(ExecutionLog).filter(
        ExecutionLog.script_id == script_id
    ).order_by(ExecutionLog.id.desc()).all()

    return {
        "logs": [
            {
                "id": log.id,
                "script_id": log.script_id,
                "status": log.status,
                "result": log.result,
                "created_at": log.created_at
            }
            for log in logs
        ]
    }

@app.post("/execute-script/{script_id}")
def execute_script(
    script_id: int,
    db: Session = Depends(get_db)
):
    script = db.query(GeneratedAutomationScript).filter(
        GeneratedAutomationScript.id == script_id
    ).first()

    if not script:
        raise HTTPException(
            status_code=404,
            detail="Script not found"
        )

    execution = run_mock_playwright_execution(
        script_id=script.id,
        script_content=script.automation_script
    )

    script.execution_status = execution["status"]
    script.execution_result = execution["result"]

    db.commit()
    db.refresh(script)

    execution_log = ExecutionLog(
        script_id=script.id,
        status=script.execution_status,
        result=script.execution_result,
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )

    db.add(execution_log)
    db.commit()

    add_activity(
        db,
        "Automation Executed",
        f"Executed automation script ID: {script.id}"
    )

    return {
        "message": "Execution completed",
        "status": script.execution_status,
        "result": script.execution_result
    }

@app.get("/projects/{project_id}/export/test-cases")
def export_project_test_cases(project_id: int, db: Session = Depends(get_db)):
    records = db.query(GeneratedTestCase).filter(
        GeneratedTestCase.project_id == project_id
    ).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["ID", "Project ID", "User Story", "Test Cases"])

    for item in records:
        writer.writerow([
            item.id,
            item.project_id,
            item.user_story,
            item.test_cases
        ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=project_{project_id}_test_cases.csv"
        }
    )


@app.get("/projects/{project_id}/export/automation-scripts")
def export_project_automation_scripts(project_id: int, db: Session = Depends(get_db)):
    records = db.query(GeneratedAutomationScript).filter(
        GeneratedAutomationScript.project_id == project_id
    ).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "ID",
        "Project ID",
        "Framework",
        "Execution Status",
        "User Story",
        "Automation Script"
    ])

    for item in records:
        writer.writerow([
            item.id,
            item.project_id,
            item.framework,
            item.execution_status,
            item.user_story,
            item.automation_script
        ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=project_{project_id}_automation_scripts.csv"
        }
    )

@app.get("/execution-file/{script_id}")
def download_execution_file(script_id: int):
    file_path = f"executions/script_{script_id}/script_{script_id}.spec.ts"

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Execution file not found")

    return FileResponse(
        path=file_path,
        filename=f"script_{script_id}.spec.ts",
        media_type="text/plain"
    )
@app.get("/allure-report/{script_id}")
def open_allure_report(script_id: int):

    report = (
        f"executions/script_{script_id}/"
        f"allure-report/index.html"
    )

    if not os.path.exists(report):
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    return FileResponse(report)
@app.get("/allure-report/{script_id}")
def open_allure_report(script_id: int):
    report_path = f"executions/script_{script_id}/allure-report/index.html"

    if not os.path.exists(report_path):
        raise HTTPException(
            status_code=404,
            detail="Allure report not found. Execute the script first."
        )

    return FileResponse(
        path=report_path,
        media_type="text/html"
    )