from sqlalchemy import Column, Integer, String
from app.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
class GeneratedTestCase(Base):
    __tablename__ = "generated_test_cases"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=True)
    user_story = Column(String)
    test_cases = Column(String)


class GeneratedAutomationScript(Base):
    __tablename__ = "generated_automation_scripts"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=True)
    user_story = Column(String)
    framework = Column(String)
    automation_script = Column(String)
    execution_status = Column(String, default="Not Executed")
    execution_result = Column(String, nullable=True)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    details = Column(String)
    created_at = Column(String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

class ExecutionLog(Base):
    __tablename__ = "execution_logs"

    id = Column(Integer, primary_key=True, index=True)
    script_id = Column(Integer)
    status = Column(String)
    result = Column(String)
    created_at = Column(String)