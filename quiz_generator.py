import os
import json
from pypdf import PdfReader
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# 1. JSON Data Structure Design (Pydantic Model)
class QuestionModel(BaseModel):
    question: str = Field(description="The text of the multiple-choice question.")
    options: list[str] = Field(description="List of exactly 4 options for the question.")
    correct_answer: int = Field(description="The index of the correct option (0 for A, 1 for B, 2 for C, 3 for D).")

class QuizModel(BaseModel):
    quiz: list[QuestionModel]

def generate_quiz_from_pdf():
    pdf_path = "test_paper.pdf"
    
    # Firebase project structure ke hisab se output path path auto-detect karein
    # Agar aapka main folder hi public hai to isse "quiz_data.json" kar sakte hain
    output_json_path = "public/quiz_data.json" if os.path.exists("public") else "quiz_data.json"

    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} file nahi mili!")
        return

    print("Step 1: PDF se text nikal rahe hain...")
    reader = PdfReader(pdf_path)
    pdf_text = ""
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pdf_text += text + "\n"

    if not pdf_text.strip():
        print("Error: PDF se koi text nahi nikal paya.")
        return

    print("Step 2: Gemini AI se questions structured data me convert kar rahe hain...")
    
    # GitHub Actions ke secrets se API Key check karne ka logic
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable nahi mila!")
        return
        
    # Explicitly pass the API key for safe cloud environments
    client = genai.Client(api_key=api_key)

    prompt = f"""
    You are an expert exam paper parser. Analyze the following text extracted from a test paper PDF.
    Extract all Multiple Choice Questions (MCQs), their 4 options, and find the correct answer key.
    
    Strictly follow the JSON schema provided. Do not include any extra text, markdown formatting, or explanations.
    
    Test Paper Text:
    {pdf_text}
    """

    # Using Gemini 2.5 Flash for fast processing
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=QuizModel,
        ),
    )

    print("Step 3: JSON file save kar rahe hain...")
    quiz_json_data = json.loads(response.text)
    final_questions_list = quiz_json_data.get("quiz", [])

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(final_questions_list, f, indent=4, ensure_ascii=False)

    print(f"Success! Test generated successfully at: {output_json_path}")

if __name__ == "__main__":
    generate_quiz_from_pdf()

