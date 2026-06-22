import os
import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv

load_dotenv()

AZURE_ORG = os.getenv("AZURE_ORG")
AZURE_PROJECT = os.getenv("AZURE_PROJECT")
AZURE_PAT = os.getenv("AZURE_PAT")

def get_azure_user_stories():
    if not AZURE_ORG or not AZURE_PROJECT or not AZURE_PAT:
        print("ERROR: Missing Azure credentials in .env file")
        return []
    
    try:
        wiql_url = f"https://dev.azure.com/{AZURE_ORG}/{AZURE_PROJECT}/_apis/wit/wiql?api-version=7.0"

        query = {
            "query": """
            SELECT [System.Id], [System.Title], [System.State]
            FROM WorkItems
            WHERE [System.WorkItemType] = 'User Story'
            ORDER BY [System.CreatedDate] DESC
            """
        }

        wiql_response = requests.post(
            wiql_url,
            json=query,
            auth=HTTPBasicAuth("", AZURE_PAT),
            headers={"Content-Type": "application/json"},
            timeout=10
        )

        print(f"Azure WIQL Status: {wiql_response.status_code}")

        if wiql_response.status_code != 200:
            print(f"Azure WIQL Error: {wiql_response.text[:300]}")
            return []

        try:
            wiql_data = wiql_response.json()
        except Exception as e:
            print(f"Azure WIQL JSON Decode Error: {str(e)}")
            print(f"Response text: {wiql_response.text[:500]}")
            return []

        work_items = wiql_data.get("workItems", [])

        if not work_items:
            print("No user stories found in Azure DevOps")
            return []

        ids = ",".join(str(item["id"]) for item in work_items[:10])

        details_url = f"https://dev.azure.com/{AZURE_ORG}/{AZURE_PROJECT}/_apis/wit/workitems?ids={ids}&api-version=7.0"

        details_response = requests.get(
            details_url,
            auth=HTTPBasicAuth("", AZURE_PAT),
            timeout=10
        )

        print(f"Azure Details Status: {details_response.status_code}")

        if details_response.status_code != 200:
            print(f"Azure Details Error: {details_response.text[:300]}")
            return []

        try:
            data = details_response.json()
        except Exception as e:
            print(f"Azure Details JSON Decode Error: {str(e)}")
            print(f"Response text: {details_response.text[:500]}")
            return []

        stories = []

        for item in data.get("value", []):
            fields = item.get("fields", {})

            stories.append({
                "id": item.get("id"),
                "title": fields.get("System.Title", "No title"),
                "status": fields.get("System.State", "Unknown"),
                "description": fields.get("System.Description", "")
            })

        return stories

    except Exception as e:
        print(f"Unexpected error in get_azure_user_stories: {str(e)}")
        return []