from pydantic import BaseModel

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
class TestCaseRequest(BaseModel):
    user_story: str
class AutomationRequest(BaseModel):
    user_story: str
    framework: str = "playwright-typescript"
class SaveTestCaseRequest(BaseModel):
    user_story: str
    test_cases: str
    project_id: int | None = None


class SaveAutomationRequest(BaseModel):
    user_story: str
    framework: str
    automation_script: str
    project_id: int | None = None
class ProjectRequest(BaseModel):
    name: str
    description: str