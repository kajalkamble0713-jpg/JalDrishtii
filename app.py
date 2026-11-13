"""
JalDrishti — Spaceborne Waterborne Outbreak Observatory
Streamlit Application Runner

This script runs and displays the full JalDrishti interactive dashboard
directly within Streamlit using Streamlit's Custom Components API.
"""

import os
import sys
import subprocess
import streamlit as st
import streamlit.components.v1 as components

# 1. Streamlit Page Configuration
st.set_page_config(
    page_title="JalDrishti — Spaceborne Outbreak Observatory",
    page_icon="🌍",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# 2. Seamless Full-Screen Dashboard Styling
st.markdown(
    """
    <style>
        /* Hide standard Streamlit header and footer chrome */
        #MainMenu { visibility: hidden; }
        header { visibility: hidden; }
        footer { visibility: hidden; }
        
        /* Remove default margins and padding */
        .block-container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
        }

        /* Streamlit iframe container sizing */
        iframe {
            width: 100% !important;
            height: 100vh !important;
            min-height: 920px !important;
            border: none !important;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

# 3. Locate or Build React Assets (dist directory)
current_dir = os.path.dirname(os.path.abspath(__file__))
dist_dir = os.path.join(current_dir, "dist")
index_html = os.path.join(dist_dir, "index.html")

if not os.path.exists(index_html):
    st.info("⚡ Building frontend distribution assets (first time setup)...")
    try:
        subprocess.run(["npm", "run", "build"], cwd=current_dir, check=True)
    except Exception as e:
        st.error(f"Failed to build assets automatically: {e}")
        st.stop()

# 4. Render Dashboard via Streamlit Component
try:
    # Use declare_component to serve the full SPA (handles JS, CSS, fonts, assets)
    jaldrishti_observatory = components.declare_component(
        "jaldrishti_observatory",
        path=dist_dir
    )
    jaldrishti_observatory()
except Exception as e:
    # Fallback to embedded HTML reader if declare_component faces specific environment constraints
    with open(index_html, "r", encoding="utf-8") as f:
        html_content = f.read()
    components.html(html_content, height=1000, scrolling=True)
