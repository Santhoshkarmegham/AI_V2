import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise Exception("GEMINI_API_KEY is missing")

client = genai.Client(api_key=GEMINI_API_KEY)


def generate_test_cases(user_story: str):
    prompt = f"""
You are a senior QA tester.

Generate QA test cases for this user story:

{user_story}

Format:
Test Case Title:
Preconditions:
Steps:
Expected Result:
Priority:
Test Type:
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text


def generate_automation_script(user_story: str, framework: str):
    prompt = f"""
You are a senior automation engineer.

Generate automation code for this user story:

{user_story}

Framework: {framework}

Rules:
- Return only automation code.
- Include required imports.
- Include assertions.
- Use clean and reusable code.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text