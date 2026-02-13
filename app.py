
import streamlit as st
from groq import Groq
import os
import json
import time
from datetime import datetime

# --- Configuration & Setup ---
st.set_page_config(
    page_title="CodeAgent Pro | Groq Workspace",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Initialize Groq API
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = None
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)

# --- Session State Initialization ---
if "user" not in st.session_state:
    st.session_state.user = None
if "code" not in st.session_state:
    st.session_state.code = '/* Sample CSS */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);\n  color: white;\n  font-family: system-ui;\n}'
if "history" not in st.session_state:
    st.session_state.history = []
if "messages" not in st.session_state:
    st.session_state.messages = []
if "active_tab" not in st.session_state:
    st.session_state.active_tab = "Editor"

# --- AI Logic Functions ---

def analyze_code(code, language, focus_areas):
    if not client: return "API Key missing."
    
    system_instruction = f"You are an Expert Code Reviewer. Analyze the code focusing on: {', '.join(focus_areas)}.\n" \
                         "CRITICAL: You MUST use these exact markdown headers:\n" \
                         "### Critical Issues\n" \
                         "### High Priority\n" \
                         "### Medium Priority\n" \
                         "### Low Priority\n" \
                         "Provide specific code examples where relevant."
    
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": f"Language: {language}\n\nCODE:\n{code}"}
        ],
        temperature=0.2
    )
    return completion.choices[0].message.content

def rewrite_code(code, language):
    if not client: return "API Key missing."
    
    system_instruction = "You are a Senior Principal Developer. Refactor and optimize the provided code.\n" \
                         "Format your response as follows:\n" \
                         "Brief summary of improvements (bullet points).\n" \
                         "---\n" \
                         "```[language]\n" \
                         "[FULL REWRITTEN CODE]\n" \
                         "```"
    
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": f"Language: {language}\n\nCODE:\n{code}"}
        ],
        temperature=0.2
    )
    return completion.choices[0].message.content

def run_simulated_code(code, language):
    if not client: return {"stdout": "", "stderr": "API Key missing."}
    
    system_prompt = """Simulate execution. Return ONLY JSON with "stdout" and "stderr" keys."""
    
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Language: {language}\nCODE:\n{code}"}
        ],
        response_format={"type": "json_object"}
    )
    try:
        return json.loads(completion.choices[0].message.content)
    except:
        return {"stdout": completion.choices[0].message.content, "stderr": "Parsing error."}

# --- UI Components ---

def login_screen():
    st.markdown("""
        <style>
        .login-container {
            max-width: 400px;
            margin: 100px auto;
            padding: 40px;
            background: #1e293b;
            border-radius: 24px;
            border: 1px solid #334155;
            color: white;
            text-align: center;
        }
        </style>
    """, unsafe_allow_value=True)
    
    with st.container():
        st.markdown("<div class='login-container'>", unsafe_allow_html=True)
        st.title("⚡ Groq Console")
        st.caption("High-Speed AI Code Refactoring")
        
        email = st.text_input("Email", placeholder="your@email.com")
        password = st.text_input("Password", type="password", placeholder="••••••••")
        
        if st.button("Sign In", use_container_width=True):
            if email and password:
                st.session_state.user = {"name": "John Developer", "email": email, "role": "Senior Engineer"}
                st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)

def main_app():
    with st.sidebar:
        st.markdown("### ⚡ Groq Agent")
        menu = ["Editor", "Review", "Rewrite", "Output", "History"]
        choice = st.radio("Navigation", menu, index=menu.index(st.session_state.active_tab), label_visibility="collapsed")
        st.session_state.active_tab = choice
        
        st.divider()
        if st.button("🚪 Logout"):
            st.session_state.user = None
            st.rerun()

    st.title("Project Workspace")
    
    if choice == "Editor":
        st.markdown("#### Main Editor")
        code_input = st.text_area("Code", value=st.session_state.code, height=500, label_visibility="collapsed")
        st.session_state.code = code_input
        
        c1, c2, c3 = st.columns(3)
        if c1.button("⚡ Run", use_container_width=True):
            with st.spinner("Groq is thinking..."):
                result = run_simulated_code(st.session_state.code, "auto")
                st.session_state.last_output = result
                st.session_state.active_tab = "Output"
                st.rerun()
        if c2.button("✨ Rewrite", use_container_width=True):
            with st.spinner("Groq is refactoring..."):
                result = rewrite_code(st.session_state.code, "auto")
                st.session_state.last_rewrite = result
                st.session_state.active_tab = "Rewrite"
                st.rerun()
        if c3.button("🔍 Analyze", use_container_width=True):
            with st.spinner("Groq is analyzing..."):
                result = analyze_code(st.session_state.code, "auto", ["Bugs", "Security"])
                st.session_state.last_review = result
                st.session_state.active_tab = "Review"
                st.rerun()

    elif choice == "Review":
        st.markdown("#### Review Analysis")
        if "last_review" in st.session_state:
            st.markdown(st.session_state.last_review)
        else:
            st.info("Analyze code in the Editor first.")

    elif choice == "Rewrite":
        st.markdown("#### Refactored Result")
        if "last_rewrite" in st.session_state:
            st.markdown(st.session_state.last_rewrite)
        else:
            st.info("Rewrite code in the Editor first.")

    elif choice == "Output":
        st.markdown("#### Simulated Terminal")
        if "last_output" in st.session_state:
            out = st.session_state.last_output
            st.code(out.get("stdout", ""), language="bash")
            if out.get("stderr"): st.error(out["stderr"])
        else:
            st.info("Run code in the Editor first.")

    # Chat Assistant
    with st.expander("💬 AI ASSISTANT", expanded=False):
        for msg in st.session_state.messages:
            with st.chat_message(msg["role"]):
                st.markdown(msg["text"])
        
        if prompt := st.chat_input("Message Groq..."):
            st.session_state.messages.append({"role": "user", "text": prompt})
            with st.chat_message("user"):
                st.markdown(prompt)
            
            with st.chat_message("assistant"):
                model_res = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "system", "content": f"Context: {st.session_state.code}"},
                        * [{"role": m["role"].replace("assistant", "assistant").replace("user", "user"), "content": m["text"]} for m in st.session_state.messages],
                        {"role": "user", "content": prompt}
                    ]
                )
                full_response = model_res.choices[0].message.content
                st.markdown(full_response)
            
            st.session_state.messages.append({"role": "assistant", "text": full_response})

if st.session_state.user is None:
    login_screen()
else:
    main_app()
