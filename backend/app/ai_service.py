import os
from dotenv import load_dotenv

load_dotenv()


def get_openai_client():
    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise Exception("OPENAI_API_KEY is missing")

    return OpenAI(api_key=api_key)


def generate_test_cases(user_story: str):
    client = get_openai_client()

    prompt = f"""
Generate QA test cases for this user story:

{user_story}

Format:
Test Case Title:
Preconditions:
Steps:
Expected Result:
Priority:
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a senior QA tester."},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content


def generate_automation_script(user_story: str, framework: str):
    client = get_openai_client()

    prompt = f"""
Generate automation code for this user story:

{user_story}

Framework: {framework}

Return only automation code.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a senior automation engineer."},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content