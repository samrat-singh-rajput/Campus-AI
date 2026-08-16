import os
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, TypedDict, Optional
from langgraph.graph import StateGraph, END
from app.services.resume_service import get_latest_user_resume
from app.services.rag_service import query_similar_documents, COLLECTION_KNOWLEDGE
from app.services.job_service import evaluate_user_recommendations
from app.services.application_service import get_user_applications

logger = logging.getLogger("campusmate.services.agent_engine")

# In-memory conversation history store
CONVERSATION_HISTORY: Dict[str, List[Dict[str, Any]]] = {}

# 1. LangGraph Agent State Definition
class AgentState(TypedDict):
    conversation_id: str
    user_id: str
    user_profile: Dict[str, Any]
    user_message: str
    intent: str
    tools_used: List[Dict[str, Any]]
    context_data: Dict[str, Any]
    final_reply: str

# 2. Tool Execution Logic using Real Services from Steps 5-8
async def execute_agent_tools(state: AgentState) -> AgentState:
    """Executes REAL underlying tools from Steps 5-8 based on classified query intent."""
    user_id = state["user_id"]
    user_profile = state["user_profile"]
    message_lower = state["user_message"].lower()

    tools_used = []
    context = {}

    # Intent A: Resume Parsing & ATS Score Check (Step 5)
    if any(k in message_lower for k in ["resume", "ats", "score", "skill", "parsed", "extract"]):
        state["intent"] = "resume_analysis"
        try:
            resume_data = await get_latest_user_resume(user_id)
            if resume_data and "parsed_data" in resume_data:
                parsed = resume_data["parsed_data"]
                ats = parsed.get("ats_analysis", {})
                context["resume"] = {
                    "filename": resume_data.get("filename"),
                    "ats_score": ats.get("overall_score"),
                    "rating": ats.get("rating"),
                    "skills": parsed.get("extracted_skills", []),
                    "suggestions": ats.get("suggestions", []),
                    "missing_keywords": ats.get("missing_recommended_keywords", [])
                }
                tools_used.append({
                    "tool_name": "get_user_resume_analysis",
                    "description": "Retrieved candidate resume text, extracted skill vector, and ATS score from MongoDB Atlas",
                    "status": "success",
                    "result_summary": f"ATS Score: {ats.get('overall_score')}/100 ({ats.get('rating')}), {len(parsed.get('extracted_skills', []))} skills parsed"
                })
            else:
                context["resume"] = None
                tools_used.append({
                    "tool_name": "get_user_resume_analysis",
                    "description": "Checked MongoDB Atlas for resume",
                    "status": "warning",
                    "result_summary": "No resume uploaded yet for this account"
                })
        except Exception as e:
            logger.error(f"Error in get_user_resume_analysis tool: {e}")

    # Intent B: Job Recommendations & Random Forest ML Classifier (Step 7)
    if any(k in message_lower for k in ["job", "recommend", "match", "role", "opportunity", "fit", "apply", "placement"]):
        if not state["intent"]:
            state["intent"] = "job_recommendations"
        try:
            recs = await evaluate_user_recommendations(user_profile)
            top_recs = recs[:3]
            context["jobs"] = [
                {
                    "id": j.get("id"),
                    "title": j.get("title"),
                    "company": j.get("company"),
                    "score": j.get("match_result", {}).get("eligibility_score"),
                    "classification": j.get("match_result", {}).get("classification"),
                    "missing_skills": j.get("match_result", {}).get("missing_skills", [])
                }
                for j in top_recs
            ]
            tools_used.append({
                "tool_name": "evaluate_user_recommendations",
                "description": "Ran Scikit-Learn Random Forest ML Model to compute candidate job eligibility across campus postings",
                "status": "success",
                "result_summary": f"Evaluated {len(recs)} placement opportunities. Top Match: {top_recs[0]['title']} at {top_recs[0]['company']} ({top_recs[0]['match_result']['eligibility_score']}%)"
            })
        except Exception as e:
            logger.error(f"Error in evaluate_user_recommendations tool: {e}")

    # Intent C: Application Pipeline Tracker (Step 8)
    if any(k in message_lower for k in ["application", "applied", "pipeline", "status", "interview", "tracker"]):
        if not state["intent"]:
            state["intent"] = "application_status"
        try:
            apps = await get_user_applications(user_id)
            context["applications"] = [
                {
                    "title": a.get("job_snapshot", {}).get("title"),
                    "company": a.get("job_snapshot", {}).get("company"),
                    "status": a.get("status"),
                    "dual_score": a.get("combined_match_score")
                }
                for a in apps
            ]
            tools_used.append({
                "tool_name": "get_user_applications",
                "description": "Retrieved active application pipeline and statuses from MongoDB Atlas",
                "status": "success",
                "result_summary": f"Retrieved {len(apps)} active applications"
            })
        except Exception as e:
            logger.error(f"Error in get_user_applications tool: {e}")

    # Intent D: ChromaDB Vector Similarity Search (Step 6)
    try:
        rag_res = query_similar_documents(COLLECTION_KNOWLEDGE, state["user_message"], n_results=2)
        if rag_res.get("results"):
            context["vector_knowledge"] = [r["document"] for r in rag_res["results"]]
            tools_used.append({
                "tool_name": "query_similar_documents",
                "description": "Executed semantic vector similarity search on persistent ChromaDB collection 'campusmate_knowledge'",
                "status": "success",
                "result_summary": f"Retrieved {len(rag_res['results'])} relevant career vector matches"
            })
    except Exception as e:
        logger.error(f"Error in RAG search tool: {e}")

    if not state["intent"]:
        state["intent"] = "general_career_advice"

    state["tools_used"] = tools_used
    state["context_data"] = context
    return state

# 3. Response Synthesis Node: Synthesizes real context into structured Markdown response
async def synthesize_agent_response(state: AgentState) -> AgentState:
    """Synthesizes real tool context into a grounded, comprehensive Markdown reply."""
    intent = state["intent"]
    user_name = state["user_profile"].get("name", "Student")
    college = state["user_profile"].get("college", "University")
    user_skills = state["user_profile"].get("skills", [])
    ctx = state["context_data"]

    reply_parts = []
    reply_parts.append(f"### 👋 Hello {user_name} ({college})!\n")

    # Resume Synthesis
    if "resume" in ctx and ctx["resume"]:
        res = ctx["resume"]
        reply_parts.append(f"#### 📄 **ATS Resume Analysis (PyPDF Step 5 Parser)**")
        reply_parts.append(f"- **Filename:** `{res['filename']}`")
        reply_parts.append(f"- **ATS Score:** `{res['ats_score']}/100` ({res['rating']})")
        reply_parts.append(f"- **Extracted Skill Vector:** {', '.join([f'`{s}`' for s in res['skills'][:8]])}")
        if res.get("missing_keywords"):
            reply_parts.append(f"- 💡 **Recommended Keywords to Add:** {', '.join([f'`{k}`' for k in res['missing_keywords']])}\n")

    # Job Matches Synthesis
    if "jobs" in ctx and ctx["jobs"]:
        reply_parts.append(f"#### 🎯 **Top ML Recommended Placement Opportunities (Step 7 Engine)**")
        for j in ctx["jobs"]:
            reply_parts.append(f"- **{j['title']}** at *{j['company']}* — **`{j['score']}% Match`** ({j['classification']})")
            if j.get("missing_skills"):
                reply_parts.append(f"  - *Skills to gain for 100% fit:* {', '.join(j['missing_skills'][:3])}")
        reply_parts.append("")

    # Application Pipeline Synthesis
    if "applications" in ctx and ctx["applications"]:
        apps = ctx["applications"]
        reply_parts.append(f"#### 📌 **Application Pipeline (Step 8 Tracker)**")
        if apps:
            for a in apps:
                reply_parts.append(f"- **{a['title']}** ({a['company']}) — Status: `{a['status']}` (Dual Match: `{a['dual_score']}%`)")
        else:
            reply_parts.append("- *No active applications submitted yet. Visit the Job Matches tab to apply!*")
        reply_parts.append("")

    # Vector Knowledge Synthesis
    if "vector_knowledge" in ctx and ctx["vector_knowledge"]:
        reply_parts.append(f"#### 💡 **ChromaDB Vector Knowledge Retrieval (Step 6 RAG)**")
        for vk in ctx["vector_knowledge"][:1]:
            summary_line = vk.split('\n')[0] if '\n' in vk else vk[:150]
            reply_parts.append(f"> *\"{summary_line}\"*")
        reply_parts.append("")

    # Next Action Recommendation
    reply_parts.append("#### 🚀 **Recommended Next Steps:**")
    if user_skills:
        reply_parts.append(f"1. Your current verified skills: {', '.join([f'`{s}`' for s in user_skills])}.")
    reply_parts.append("2. Upload or update your PDF resume in **My Resume** to boost your ATS compatibility.")
    reply_parts.append("3. Explore target roles in **Job Matches** and apply to start your placement pipeline!")

    state["final_reply"] = "\n".join(reply_parts)
    return state

# 4. Construct LangGraph Workflow Graph
def build_langgraph_agent():
    """Constructs stateful LangGraph workflow graph."""
    workflow = StateGraph(AgentState)

    # Add Nodes
    workflow.add_node("execute_tools", execute_agent_tools)
    workflow.add_node("synthesize_response", synthesize_agent_response)

    # Entry Point & Edges
    workflow.set_entry_point("execute_tools")
    workflow.add_edge("execute_tools", "synthesize_response")
    workflow.add_edge("synthesize_response", END)

    return workflow.compile()

# Singleton compiled LangGraph agent instance
_compiled_agent = build_langgraph_agent()

async def run_langgraph_agent(
    user_id: str,
    user_profile: Dict[str, Any],
    message: str,
    conversation_id: Optional[str] = None
) -> Dict[str, Any]:
    """Executes the compiled LangGraph agent on user query and returns grounded response."""
    conv_id = conversation_id or str(uuid.uuid4())

    initial_state: AgentState = {
        "conversation_id": conv_id,
        "user_id": user_id,
        "user_profile": user_profile,
        "user_message": message,
        "intent": "",
        "tools_used": [],
        "context_data": {},
        "final_reply": ""
    }

    # Invoke compiled LangGraph graph
    final_state = await _compiled_agent.ainvoke(initial_state)

    # Record message history
    if conv_id not in CONVERSATION_HISTORY:
        CONVERSATION_HISTORY[conv_id] = []

    CONVERSATION_HISTORY[conv_id].append({
        "sender": "user",
        "text": message,
        "timestamp": datetime.now(timezone.utc)
    })

    CONVERSATION_HISTORY[conv_id].append({
        "sender": "agent",
        "text": final_state["final_reply"],
        "tools_used": final_state["tools_used"],
        "timestamp": datetime.now(timezone.utc)
    })

    return {
        "conversation_id": conv_id,
        "reply": final_state["final_reply"],
        "tools_used": final_state["tools_used"],
        "context_data": final_state["context_data"],
        "created_at": datetime.now(timezone.utc)
    }

def get_conversation_history(conv_id: str) -> List[Dict[str, Any]]:
    """Retrieves conversation history for a given ID."""
    return CONVERSATION_HISTORY.get(conv_id, [])

def clear_conversation_history(conv_id: str) -> bool:
    """Clears conversation history."""
    if conv_id in CONVERSATION_HISTORY:
        del CONVERSATION_HISTORY[conv_id]
        return True
    return False
