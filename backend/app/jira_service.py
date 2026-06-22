import os
import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv

load_dotenv()

JIRA_BASE_URL = os.getenv("JIRA_BASE_URL")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")


def get_jira_user_stories():
    if not JIRA_BASE_URL or not JIRA_EMAIL or not JIRA_API_TOKEN:
        print("ERROR: Missing Jira credentials in .env file")
        return []
    
    print(f"DEBUG: Using Jira URL: {JIRA_BASE_URL}")
    print(f"DEBUG: Using Jira Email: {JIRA_EMAIL}")
    
    # Use the correct /search/jql endpoint with GET method
    url = f"{JIRA_BASE_URL}/rest/api/3/search/jql"

    # Try multiple JQL queries to find stories
    jql_queries = [
        'type = Story AND created >= -365d',
        'issuetype = Story AND created >= -365d',
        'created >= -365d',  # Get all recent issues as fallback
    ]
    
    data = None
    
    for jql in jql_queries:
        try:
            # Using /search/jql endpoint with GET and proper parameters
            params = {
                "jql": jql,
                "maxResults": 50,
                "fields": "summary,description,status,issuetype,key"
            }

            print(f"\nDEBUG: Trying JQL: {jql}")
            print(f"DEBUG: URL: {url}")

            response = requests.get(
                url,
                params=params,
                auth=HTTPBasicAuth(JIRA_EMAIL, JIRA_API_TOKEN),
                headers={"Accept": "application/json"},
                timeout=10
            )

            print(f"JIRA JQL: {jql}")
            print(f"JIRA STATUS: {response.status_code}")
            print(f"JIRA RESPONSE: {response.text[:500]}")

            if response.status_code == 200:
                data = response.json()
                print(f"DEBUG: Got {len(data.get('issues', []))} issues")
                # If we got issues, break out of loop
                if data.get("issues"):
                    print(f"SUCCESS: Found {len(data.get('issues'))} issues with query: {jql}")
                    break
            else:
                print(f"Failed with query: {jql} - Status: {response.status_code}")
        except Exception as e:
            print(f"Error with query '{jql}': {str(e)}")
            continue

    if not data:
        print("WARNING: Could not fetch stories from Jira API - all queries failed")
        return []

    stories = []

    for issue in data.get("issues", []):
        fields = issue.get("fields", {})
        
        # Extract description - handle both string and Jira document format
        description = fields.get("description", "")
        if isinstance(description, dict):
            # Jira document format - try to extract text
            description = extract_text_from_jira_doc(description)

        stories.append({
            "id": issue.get("key"),
            "title": fields.get("summary", "No title"),
            "status": fields.get("status", {}).get("name") if fields.get("status") else "Unknown",
            "type": fields.get("issuetype", {}).get("name") if fields.get("issuetype") else "Unknown",
            "description": description
        })

    print(f"DEBUG: Returning {len(stories)} stories")
    return stories


def extract_text_from_jira_doc(doc):
    """Extract plain text from Jira's document format"""
    if not isinstance(doc, dict):
        return str(doc) if doc else ""
    
    text_parts = []
    
    def extract_from_content(content_list):
        if not isinstance(content_list, list):
            return
        for item in content_list:
            if isinstance(item, dict):
                # Handle different content types
                if item.get("type") == "text":
                    text = item.get("text", "")
                    if text:
                        text_parts.append(text)
                # Recursively extract from nested content
                if "content" in item:
                    extract_from_content(item["content"])
    
    # Extract from top-level content
    if "content" in doc:
        extract_from_content(doc["content"])
    
    return " ".join(text_parts) if text_parts else ""