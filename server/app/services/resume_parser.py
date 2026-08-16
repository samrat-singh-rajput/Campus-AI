import re
import io
import logging
from typing import Dict, List, Any, Tuple
import pypdf

logger = logging.getLogger("campusmate.services.resume_parser")

# Comprehensive Technical Skill Dictionary
SKILL_TAXONOMY: Dict[str, List[str]] = {
    "Languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang", "rust",
        "html", "css", "sql", "bash", "shell", "r", "kotlin", "swift", "php"
    ],
    "Frameworks & Libraries": [
        "react", "react.js", "next.js", "vue", "vue.js", "angular", "node.js", "express",
        "fastapi", "flask", "django", "spring boot", "tailwind", "tailwindcss", "bootstrap",
        "redux", "graphql", "rest api", "pandas", "numpy", "scikit-learn", "pytorch", "tensorflow"
    ],
    "Databases": [
        "mongodb", "postgresql", "postgres", "mysql", "sqlite", "redis", "dynamodb",
        "elasticsearch", "chromadb", "neo4j", "cassandra"
    ],
    "Cloud & DevOps": [
        "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes",
        "ci/cd", "github actions", "terraform", "nginx", "linux"
    ],
    "AI & Data Science": [
        "machine learning", "deep learning", "nlp", "natural language processing",
        "computer vision", "langchain", "langgraph", "rag", "vector embeddings", "openai",
        "llm", "transformers", "bert"
    ],
    "Tools & Methodology": [
        "git", "github", "gitlab", "jira", "agile", "scrum", "unit testing", "pytest",
        "postman", "figma", "vscode"
    ]
}

# Standard Resume Section Keywords
SECTION_PATTERNS = {
    "Contact Info": [r"email", r"phone", r"linkedin", r"github", r"contact"],
    "Summary / Objective": [r"summary", r"profile", r"objective", r"about me"],
    "Education": [r"education", r"academic", r"university", r"college", r"degree", r"bachelor", r"master"],
    "Experience": [r"experience", r"employment", r"work history", r"internship", r"professional experience"],
    "Skills": [r"skills", r"technical skills", r"technologies", r"competencies", r"expertise"],
    "Projects": [r"projects", r"personal projects", r"key projects", r"academic projects"],
    "Certifications": [r"certifications", r"certificates", r"licenses", r"achievements"]
}

# Recommended High-Impact Industry Keywords for Tech Roles
HIGH_IMPACT_KEYWORDS = [
    "FastAPI", "React", "TypeScript", "Python", "MongoDB", "Docker", "REST API",
    "Git", "CI/CD", "AWS", "Machine Learning", "Unit Testing"
]

# Canonical Display Casing Map for Technical Skills
CANONICAL_CASING = {
    "python": "Python", "javascript": "JavaScript", "typescript": "TypeScript", "java": "Java",
    "c++": "C++", "c#": "C#", "go": "Go", "golang": "Golang", "rust": "Rust", "html": "HTML",
    "css": "CSS", "sql": "SQL", "bash": "Bash", "shell": "Shell", "r": "R", "kotlin": "Kotlin",
    "swift": "Swift", "php": "PHP", "react": "React", "react.js": "React.js", "next.js": "Next.js",
    "vue": "Vue", "vue.js": "Vue.js", "angular": "Angular", "node.js": "Node.js", "express": "Express",
    "fastapi": "FastAPI", "flask": "Flask", "django": "Django", "spring boot": "Spring Boot",
    "tailwind": "Tailwind", "tailwindcss": "TailwindCSS", "bootstrap": "Bootstrap", "redux": "Redux",
    "graphql": "GraphQL", "rest api": "REST API", "pandas": "Pandas", "numpy": "NumPy",
    "scikit-learn": "Scikit-Learn", "pytorch": "PyTorch", "tensorflow": "TensorFlow",
    "mongodb": "MongoDB", "postgresql": "PostgreSQL", "postgres": "PostgreSQL", "mysql": "MySQL",
    "sqlite": "SQLite", "redis": "Redis", "dynamodb": "DynamoDB", "elasticsearch": "Elasticsearch",
    "chromadb": "ChromaDB", "neo4j": "Neo4j", "cassandra": "Cassandra", "aws": "AWS",
    "amazon web services": "Amazon Web Services", "azure": "Azure", "gcp": "GCP",
    "google cloud": "Google Cloud", "docker": "Docker", "kubernetes": "Kubernetes",
    "ci/cd": "CI/CD", "github actions": "GitHub Actions", "terraform": "Terraform",
    "nginx": "NGINX", "linux": "Linux", "machine learning": "Machine Learning",
    "deep learning": "Deep Learning", "nlp": "NLP", "natural language processing": "Natural Language Processing",
    "computer vision": "Computer Vision", "langchain": "LangChain", "langgraph": "LangGraph",
    "rag": "RAG", "vector embeddings": "Vector Embeddings", "openai": "OpenAI",
    "llm": "LLM", "transformers": "Transformers", "bert": "BERT", "git": "Git",
    "github": "GitHub", "gitlab": "GitLab", "jira": "Jira", "agile": "Agile",
    "scrum": "Scrum", "unit testing": "Unit Testing", "pytest": "PyTest",
    "postman": "Postman", "figma": "Figma", "vscode": "VSCode"
}

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts raw string text from PDF file bytes."""
    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        extracted_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text.append(text)
        return "\n".join(extracted_text)
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise ValueError(f"Failed to parse PDF document: {str(e)}")

def parse_resume_content(raw_text: str) -> Dict[str, Any]:
    """Analyzes raw resume text and computes structured skills, contact info, and ATS metrics."""
    clean_text = raw_text.strip()
    text_lower = clean_text.lower()
    words = re.findall(r'\w+', text_lower)
    word_count = len(words)

    # 1. Contact Information Extraction
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', clean_text)
    email = email_match.group(0) if email_match else None

    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}', clean_text)
    phone = phone_match.group(0) if phone_match else None

    links = re.findall(r'https?://[^\s>]+|linkedin\.com/in/[^\s>]+|github\.com/[^\s>]+', clean_text, re.IGNORECASE)

    # 2. Skill Extraction & Categorization
    detected_skills: List[str] = []
    skill_categories: Dict[str, List[str]] = {}

    for category, skill_list in SKILL_TAXONOMY.items():
        matched_cat_skills = []
        for skill in skill_list:
            # Word boundary regex search to prevent partial word matches
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                formatted_skill = CANONICAL_CASING.get(skill, skill.title() if len(skill) > 3 else skill.upper())
                if formatted_skill not in detected_skills:
                    detected_skills.append(formatted_skill)
                    matched_cat_skills.append(formatted_skill)
        if matched_cat_skills:
            skill_categories[category] = matched_cat_skills

    # 3. Section Detection
    detected_sections: List[str] = []
    section_checks: List[Dict[str, Any]] = []

    for section_name, patterns in SECTION_PATTERNS.items():
        is_present = False
        for p in patterns:
            if re.search(r'\b' + p + r'\b', text_lower):
                is_present = True
                break
        
        if is_present:
            detected_sections.append(section_name)
            section_checks.append({
                "name": section_name,
                "present": True,
                "score": 15 if section_name in ["Education", "Experience", "Skills"] else 10,
                "feedback": f"{section_name} section clearly detected."
            })
        else:
            section_checks.append({
                "name": section_name,
                "present": False,
                "score": 0,
                "feedback": f"Missing {section_name} header. Add a clear header for better ATS indexing."
            })

    # 4. ATS Scoring Algorithm (0 - 100)
    # Weights: Section completeness (50%), Skill diversity (30%), Formatting & word count (20%)
    present_section_score = sum(c["score"] for c in section_checks if c["present"])
    section_points = min(50, present_section_score)

    skill_count = len(detected_skills)
    skill_points = min(30, int((skill_count / 10) * 30))

    length_points = 0
    if 250 <= word_count <= 1200:
        length_points = 20
    elif 150 <= word_count < 250:
        length_points = 10
    else:
        length_points = 5

    overall_score = min(100, section_points + skill_points + length_points)

    # ATS Rating Categorization
    if overall_score >= 80:
        rating = "Excellent"
    elif overall_score >= 65:
        rating = "Strong"
    elif overall_score >= 50:
        rating = "Needs Improvement"
    else:
        rating = "Critical Action Required"

    # 5. Suggestions & Missing Keyword Alerts
    suggestions = []
    if not email:
        suggestions.append("Add a clear email address at the top of your resume.")
    if not phone:
        suggestions.append("Include a contact phone number.")
    if "Experience" not in detected_sections:
        suggestions.append("Add an 'Experience' or 'Projects' section detailing achievements.")
    if "Education" not in detected_sections:
        suggestions.append("Explicitly state your degree, university, and graduation year under 'Education'.")
    if skill_count < 8:
        suggestions.append("Expand your skills list to include at least 8 to 12 core technical skills.")
    if word_count < 250:
        suggestions.append("Your resume text is brief. Expand on project descriptions and quantifiable outcomes.")

    missing_keywords = [
        kw for kw in HIGH_IMPACT_KEYWORDS
        if kw.lower() not in text_lower
    ]

    return {
        "email": email,
        "phone": phone,
        "links": links,
        "extracted_skills": detected_skills,
        "skill_categories": skill_categories,
        "detected_sections": detected_sections,
        "word_count": word_count,
        "ats_analysis": {
            "overall_score": overall_score,
            "rating": rating,
            "section_checks": section_checks,
            "matched_skills_count": skill_count,
            "suggestions": suggestions,
            "missing_recommended_keywords": missing_keywords[:6]
        }
    }
