import os
import json
import subprocess
from datetime import datetime


def run_mock_playwright_execution(script_id: int, script_content: str):
    execution_dir = f"executions/script_{script_id}"
    os.makedirs(execution_dir, exist_ok=True)

    script_file = os.path.join(execution_dir, f"script_{script_id}.spec.ts")

    with open(script_file, "w", encoding="utf-8") as file:
        file.write(script_content)

    executed_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    result = f"""
Execution Type: Mock Playwright Execution
Script ID: {script_id}
Script File: {script_file}
Status: Passed
Executed At: {executed_at}

Total Tests: 5
Passed: 5
Failed: 0
Duration: 12s
"""

    allure_results = os.path.join(execution_dir, "allure-results")
    allure_report = os.path.join(execution_dir, "allure-report")

    os.makedirs(allure_results, exist_ok=True)

    dummy_result = {
        "uuid": f"testpilot-{script_id}",
        "name": f"Mock Playwright Execution - Script {script_id}",
        "fullName": f"TestPilot AI Script {script_id}",
        "status": "passed",
        "stage": "finished",
        "start": int(datetime.now().timestamp() * 1000),
        "stop": int(datetime.now().timestamp() * 1000) + 12000,
        "labels": [
            {"name": "framework", "value": "playwright"},
            {"name": "tool", "value": "TestPilot AI"},
        ],
    }

    result_file = os.path.join(
        allure_results,
        f"{script_id}-result.json"
    )

    with open(result_file, "w", encoding="utf-8") as file:
        json.dump(dummy_result, file, indent=2)

    try:
        subprocess.run(
            [
                "allure",
                "generate",
                allure_results,
                "-o",
                allure_report,
                "--clean",
            ],
            check=False,
            capture_output=True,
            text=True,
        )
    except Exception as e:
        print(f"Allure report generation failed: {e}")

    return {
        "status": "Passed",
        "result": result,
        "script_file": script_file,
        "allure_results": allure_results,
        "allure_report": allure_report,
    }