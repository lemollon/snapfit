import streamlit as st
import anthropic
import base64
import json
import os
from io import BytesIO
from PIL import Image
from datetime import datetime
import time
import sqlite3
import hashlib
import secrets
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER

# Page configuration
st.set_page_config(
    page_title="SnapFit - AI Workout Planner",
    page_icon="📸",
    layout="wide"
)

# Custom CSS
st.markdown("""
<style>
    .main {
        background: linear-gradient(to bottom right, #EFF6FF, #E0E7FF);
    }
    .stButton>button {
        width: 100%;
    }
    .equipment-tag {
        display: inline-block;
        background-color: #818CF8;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        margin: 0.25rem;
        font-size: 0.875rem;
    }
    .exercise-card {
        background-color: #F3F4F6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 0.75rem;
    }
    .timer-display {
        font-size: 4rem;
        font-weight: bold;
        text-align: center;
        color: #4F46E5;
        margin: 1rem 0;
    }
    .login-prompt {
        text-align: center;
        padding: 3rem 2rem;
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        max-width: 500px;
        margin: 2rem auto;
    }
    .share-code {
        background-color: #EFF6FF;
        padding: 1rem;
        border-radius: 0.5rem;
        font-family: monospace;
        font-size: 1.5rem;
        text-align: center;
        border: 2px dashed #4F46E5;
    }
</style>
""", unsafe_allow_html=True)

# Database functions
def init_database():
    """Initialize SQLite database with tables"""
    conn = sqlite3.connect('workout_planner.db')
    c = conn.cursor()
    
    # Users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT,
            reset_token TEXT,
            reset_token_expiry TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Workout history table
    c.execute('''
        CREATE TABLE IF NOT EXISTS workout_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            workout_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            duration INTEGER NOT NULL,
            fitness_level TEXT NOT NULL,
            equipment TEXT,
            exercises_count INTEGER,
            workout_data TEXT,
            is_public BOOLEAN DEFAULT 0,
            share_code TEXT UNIQUE,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Shared workouts table
    c.execute('''
        CREATE TABLE IF NOT EXISTS shared_workouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_id INTEGER NOT NULL,
            shared_by_user_id INTEGER NOT NULL,
            shared_with_user_id INTEGER NOT NULL,
            shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (workout_id) REFERENCES workout_history (id),
            FOREIGN KEY (shared_by_user_id) REFERENCES users (id),
            FOREIGN KEY (shared_with_user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_share_code():
    """Generate a unique 8-character share code"""
    return secrets.token_urlsafe(6)[:8].upper()

def create_user(username, password, email=None):
    """Create a new user"""
    conn = sqlite3.connect('workout_planner.db')
    c = conn.cursor()
    
    try:
        c.execute('INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
                  (username, hash_password(password), email))
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        conn.close()
        return False

def authenticate_user(username, password):
    """Authenticate user and return user_id if successful"""
    conn = sqlite3.connect('workout_planner.db')
    c = conn.cursor()
    
    c.execute('SELECT id, password_hash FROM users WHERE username = ?', (username,))
    result = c.fetchone()
    conn.close()
    
    if result and result[1] == hash_password(password):
        return result[0]
    return None

def get_user_email(username):
    """Get user's email"""
    conn = sqlite3.connect('workout_planner.db')
    c = conn.cursor()
    c.execute('SELECT email FROM users WHERE username = ?', (username,))
    result = c.fetchone()
    conn.close()
    return result[0] if result else None

def update_password(user_id, new_password):
    """Update user's password"""
    conn = sqlite3.connect('workout_planner.db')
    c = conn.cursor()
    c.execute('UPDATE users SET password_hash = ? WHERE id = ?',
              (hash_password(new_password), user_id))
    conn.commit()
    conn.close()

def update_email(user_id, new_email):
    """Update user's email"""
    conn = sqlite3.connect('workout_planner.db')
    c = conn.cursor()
    c.execute('UPDATE users SET email = ? WHERE id = ?', (new_email, user_id))
    conn.commit()
    conn.close()

def search_users(query):
    """Search for users by username"""
    conn = sqlite3.connect('workout_planner.db')
    c = conn.cursor()
    c.execute('SELECT id, username FROM users WHERE username LIKE ? LIMIT 10',
              (f'%{query}%',))
    results = c.fetchall()
    conn.close()
    return results

def save_workout_to_db(user_id, workout_plan, fitness_level, duration, is_public=False):
    """Save workout to database"""
    conn = sqlite3.connect('workout_planner.db')
    c = conn.cursor()
    
    equipment_str = json.dumps(workout_plan.get('equipment', []))
    workout_data_str = json.dumps(workout_plan)
    exercises_count = len(workout_plan['workout']['main'])
    share_code = generate_share_code() if is_public else None
    
    c.execute('''
        INSERT INTO workout_history 
        (user_id, duration, fitness_level, equipment, exercises_count, workout_data, is_public, share_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, duration, fitness_level, equipment_str, exercises_count, workout_data_str, is_public, share_code))
    
    workout_id = c.lastrowid
    conn.commit()
    conn.close()
    return workout_id, share_code

def share_workout_with_user(workout_id, shared_by_user_id, shared_with_user_id):
    """Share a workout with another user"""
    conn = sqlite3.connect('workout_planner.db')
    c = conn.cursor()
    
    try:
        c.execute('''
            INSERT INTO shared_workouts (workout_id, shared_by_user_id, shared_with_user_id)
            VALUES (?, ?, ?)
        ''', (workout_id, shared_by_user_id, shared_with_user_id))
        conn.commit()
        conn.close()
        return True
    except:
        conn.close()
        return False

def get_user_workouts(user_id):
    """Get all workouts for a user"""
    conn = sqlite3.connect('workout_planner.db')
    c = conn.cursor()
    
    c.execute('''
        SELECT id, workout_date, duration, fitness_level, equipment, exercises_count, workout_data, is_public, share_code
        FROM workout_history
        WHERE user_id = ?
        ORDER BY workout_date DESC
    ''', (user_id,))
    
    workouts = []
    for row in c.fetchall():
        workouts.append({
            'id': row[0],
            'date': row[1],
            'duration': row[2],
            'fitness_level': row[3],
            'equipment': json.loads(row[4]),
            'exercises': row[5],
            'workout': json.loads(row[6]),
            'is_public': row[7],
            'share_code': row[8]
        })
    
    conn.close()
    return workouts

def get_shared_workouts(user_id):
    """Get workouts shared with this user"""
    conn = sqlite3.connect('workout_planner.db')
    c = conn.cursor()
    
    c.execute('''
        SELECT w.id, w.workout_date, w.duration, w.fitness_level, w.equipment, 
               w.exercises_count, w.workout_data, u.username
        FROM workout_history w
        JOIN shared_workouts s ON w.id = s.workout_id
        JOIN users u ON s.shared_by_user_id = u.id
        WHERE s.shared_with_user_id = ?
        ORDER BY s.shared_at DESC
    ''', (user_id,))
    
    workouts = []
    for row in c.fetchall():
        workouts.append({
            'id': row[0],
            'date': row[1],
            'duration': row[2],
            'fitness_level': row[3],
            'equipment': json.loads(row[4]),
            'exercises': row[5],
            'workout': json.loads(row[6]),
            'shared_by': row[7]
        })
    
    conn.close()
    return workouts

def get_workout_by_share_code(share_code):
    """Get a workout by its share code"""
    conn = sqlite3.connect('workout_planner.db')
    c = conn.cursor()
    
    c.execute('''
        SELECT w.id, w.workout_date, w.duration, w.fitness_level, w.equipment,
               w.exercises_count, w.workout_data, u.username
        FROM workout_history w
        JOIN users u ON w.user_id = u.id
        WHERE w.share_code = ? AND w.is_public = 1
    ''', (share_code,))
    
    result = c.fetchone()
    conn.close()
    
    if result:
        return {
            'id': result[0],
            'date': result[1],
            'duration': result[2],
            'fitness_level': result[3],
            'equipment': json.loads(result[4]),
            'exercises': result[5],
            'workout': json.loads(result[6]),
            'created_by': result[7]
        }
    return None

def delete_workout(workout_id, user_id):
    """Delete a specific workout"""
    conn = sqlite3.connect('workout_planner.db')
    c = conn.cursor()
    
    c.execute('DELETE FROM workout_history WHERE id = ? AND user_id = ?', (workout_id, user_id))
    conn.commit()
    conn.close()

def get_user_stats(user_id):
    """Get workout statistics for a user"""
    conn = sqlite3.connect('workout_planner.db')
    c = conn.cursor()
    
    c.execute('''
        SELECT 
            COUNT(*) as total_workouts,
            SUM(exercises_count) as total_exercises,
            SUM(duration) as total_minutes
        FROM workout_history
        WHERE user_id = ?
    ''', (user_id,))
    
    result = c.fetchone()
    conn.close()
    
    return {
        'total_workouts': result[0] or 0,
        'total_exercises': result[1] or 0,
        'total_minutes': result[2] or 0
    }

# Initialize database
init_database()

# Initialize session state
if 'logged_in' not in st.session_state:
    st.session_state.logged_in = False
if 'user_id' not in st.session_state:
    st.session_state.user_id = None
if 'username' not in st.session_state:
    st.session_state.username = None
if 'photos' not in st.session_state:
    st.session_state.photos = []
if 'workout_plan' not in st.session_state:
    st.session_state.workout_plan = None
if 'detected_equipment' not in st.session_state:
    st.session_state.detected_equipment = []
if 'timer_running' not in st.session_state:
    st.session_state.timer_running = False
if 'timer_seconds' not in st.session_state:
    st.session_state.timer_seconds = 60
if 'timer_start_time' not in st.session_state:
    st.session_state.timer_start_time = None
if 'show_login_modal' not in st.session_state:
    st.session_state.show_login_modal = False

def image_to_base64(image):
    """Convert PIL Image to base64 string"""
    buffered = BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode()

def analyze_environment(photos, fitness_level, duration, workout_types, api_key):
    """Analyze the environment using Claude API"""
    
    client = anthropic.Anthropic(api_key=api_key)
    
    selected_types = ', '.join([k for k, v in workout_types.items() if v])
    
    # Prepare image contents
    image_contents = []
    for photo in photos:
        img_base64 = image_to_base64(photo)
        image_contents.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/jpeg",
                "data": img_base64
            }
        })
    
    prompt = f"""You are an expert personal trainer. Analyze these {len(photos)} photo(s) of a workout environment.

TASK 1 - EQUIPMENT DETECTION:
Identify ALL workout equipment, furniture, or environmental features that could be used for exercise. Be creative and thorough. Include:
- Traditional gym equipment (dumbbells, barbells, machines, etc.)
- Bodyweight workout areas (open floor space, walls, stairs, etc.)
- Improvised equipment (chairs, tables, countertops, sturdy furniture, etc.)
- Outdoor features (benches, bars, hills, etc.)

TASK 2 - WORKOUT ROUTINE:
Create a detailed {duration}-minute workout routine for a {fitness_level} level fitness enthusiast.
Focus on: {selected_types}

Include:
- Warm-up (3-5 minutes)
- Main workout with specific exercises
- For each exercise: name, sets, reps/duration, and brief form tips
- Cool-down/stretch (3-5 minutes)

Respond in this EXACT JSON format:
{{
  "equipment": ["item1", "item2", ...],
  "workout": {{
    "warmup": [
      {{"name": "exercise name", "duration": "X minutes", "description": "brief description"}}
    ],
    "main": [
      {{"name": "exercise name", "sets": X, "reps": "X reps or X seconds", "equipment": "what to use", "tips": "form tips"}}
    ],
    "cooldown": [
      {{"name": "stretch name", "duration": "X seconds", "description": "brief description"}}
    ]
  }},
  "notes": "Any important safety notes or modifications"
}}

CRITICAL: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation text."""
    
    content = image_contents + [{"type": "text", "text": prompt}]
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        messages=[{"role": "user", "content": content}]
    )
    
    response_text = message.content[0].text
    response_text = response_text.replace("```json", "").replace("```", "").strip()
    
    return json.loads(response_text)

def generate_pdf(workout_plan, duration, fitness_level):
    """Generate PDF of workout plan"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#4F46E5'),
        spaceAfter=12,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#4F46E5'),
        spaceAfter=8,
        spaceBefore=12
    )
    
    story.append(Paragraph(f"💪 {duration}-Minute Workout Plan", title_style))
    story.append(Paragraph(f"Fitness Level: {fitness_level.capitalize()}", styles['Normal']))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("🎯 Equipment & Features", heading_style))
    equipment_text = ", ".join(workout_plan.get('equipment', []))
    story.append(Paragraph(equipment_text, styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("🔥 Warm-up", heading_style))
    for ex in workout_plan['workout']['warmup']:
        story.append(Paragraph(f"<b>{ex['name']}</b> - {ex['duration']}", styles['Normal']))
        story.append(Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;{ex['description']}", styles['Normal']))
        story.append(Spacer(1, 0.1*inch))
    
    story.append(Paragraph("💪 Main Workout", heading_style))
    for ex in workout_plan['workout']['main']:
        story.append(Paragraph(f"<b>{ex['name']}</b> - {ex['sets']} sets × {ex['reps']}", styles['Normal']))
        story.append(Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;Equipment: {ex['equipment']}", styles['Normal']))
        story.append(Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;Tips: {ex['tips']}", styles['Normal']))
        story.append(Spacer(1, 0.1*inch))
    
    story.append(Paragraph("🧘 Cool-down & Stretch", heading_style))
    for ex in workout_plan['workout']['cooldown']:
        story.append(Paragraph(f"<b>{ex['name']}</b> - {ex['duration']}", styles['Normal']))
        story.append(Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;{ex['description']}", styles['Normal']))
        story.append(Spacer(1, 0.1*inch))
    
    if workout_plan.get('notes'):
        story.append(Spacer(1, 0.2*inch))
        story.append(Paragraph("⚠️ Important Notes", heading_style))
        story.append(Paragraph(workout_plan['notes'], styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer

def show_login_prompt(message, key_prefix):
    """Show a login prompt with custom message"""
    st.markdown(f"""
    <div class="login-prompt">
        <h2>🔒 {message}</h2>
        <p style="color: #6B7280; margin: 1rem 0;">Create a free account to unlock this feature</p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("📝 Create Account", type="primary", use_container_width=True, key=f"create_{key_prefix}"):
            st.session_state.show_login_modal = True
            st.rerun()
    with col2:
        if st.button("🔐 Login", use_container_width=True, key=f"login_{key_prefix}"):
            st.session_state.show_login_modal = True
            st.rerun()

# Get API key from environment variables or secrets
api_key = os.environ.get("ANTHROPIC_API_KEY", "") or st.secrets.get("ANTHROPIC_API_KEY", "")

# Header
col1, col2 = st.columns([6, 1])
with col1:
    st.title("📸 SnapFit")
    st.caption("Snap. Train. Transform.")
    if st.session_state.logged_in:
        st.markdown(f"Welcome back, **{st.session_state.username}**!")
    else:
        st.markdown("**Try it free** - No account needed to generate workouts!")

with col2:
    if st.session_state.logged_in:
        if st.button("🚪 Logout"):
            st.session_state.logged_in = False
            st.session_state.user_id = None
            st.session_state.username = None
            st.rerun()
    else:
        if st.button("🔐 Login"):
            st.session_state.show_login_modal = True
            st.rerun()

# Show login/register modal if triggered
if st.session_state.show_login_modal and not st.session_state.logged_in:
    with st.container():
        st.markdown("---")
        tab1, tab2 = st.tabs(["🔐 Login", "📝 Register"])
        
        with tab1:
            st.subheader("Login to Your Account")
            login_username = st.text_input("Username", key="login_username")
            login_password = st.text_input("Password", type="password", key="login_password")
            
            col1, col2 = st.columns(2)
            with col1:
                if st.button("Login", type="primary", use_container_width=True):
                    if login_username and login_password:
                        user_id = authenticate_user(login_username, login_password)
                        if user_id:
                            st.session_state.logged_in = True
                            st.session_state.user_id = user_id
                            st.session_state.username = login_username
                            st.session_state.show_login_modal = False
                            st.success(f"Welcome back, {login_username}!")
                            st.rerun()
                        else:
                            st.error("Invalid username or password")
                    else:
                        st.warning("Please enter both username and password")
            with col2:
                if st.button("Cancel", use_container_width=True):
                    st.session_state.show_login_modal = False
                    st.rerun()
        
        with tab2:
            st.subheader("Create New Account")
            reg_username = st.text_input("Choose Username", key="reg_username")
            reg_email = st.text_input("Email (optional)", key="reg_email")
            reg_password = st.text_input("Choose Password", type="password", key="reg_password")
            reg_password_confirm = st.text_input("Confirm Password", type="password", key="reg_password_confirm")
            
            col1, col2 = st.columns(2)
            with col1:
                if st.button("Register", type="primary", use_container_width=True):
                    if reg_username and reg_password and reg_password_confirm:
                        if len(reg_username) < 3:
                            st.error("Username must be at least 3 characters")
                        elif len(reg_password) < 6:
                            st.error("Password must be at least 6 characters")
                        elif reg_password != reg_password_confirm:
                            st.error("Passwords don't match")
                        else:
                            if create_user(reg_username, reg_password, reg_email or None):
                                user_id = authenticate_user(reg_username, reg_password)
                                st.session_state.logged_in = True
                                st.session_state.user_id = user_id
                                st.session_state.username = reg_username
                                st.session_state.show_login_modal = False
                                st.success("Account created! Welcome to SnapFit!")
                                st.rerun()
                            else:
                                st.error("Username already exists")
                    else:
                        st.warning("Please fill in username and password fields")
            with col2:
                if st.button("Cancel ", use_container_width=True):
                    st.session_state.show_login_modal = False
                    st.rerun()
        st.markdown("---")

# Create tabs
if st.session_state.logged_in:
    tab1, tab2, tab3, tab4, tab5 = st.tabs(["🏋️ Create Workout", "⏱️ Rest Timer", "📊 History", "🤝 Shared", "⚙️ Settings"])
else:
    tab1, tab2, tab3, tab4, tab5 = st.tabs(["🏋️ Create Workout", "⏱️ Rest Timer", "📊 History", "🤝 Shared", "⚙️ Settings"])

with tab1:
    # Sidebar
    with st.sidebar:
        st.header("⚙️ Your Preferences")
        
        if not api_key:
            api_key = st.text_input("Anthropic API Key", type="password", help="Enter your Anthropic API key")
        
        st.divider()
        
        fitness_level = st.selectbox("Fitness Level", ["beginner", "intermediate", "advanced"])
        duration = st.slider("⏱️ Workout Duration (minutes)", min_value=10, max_value=120, value=30, step=5)
        
        st.subheader("Workout Types")
        workout_types = {
            "strength": st.checkbox("Strength", value=True),
            "cardio": st.checkbox("Cardio", value=True),
            "bodyweight": st.checkbox("Bodyweight", value=True),
            "flexibility": st.checkbox("Flexibility", value=True)
        }
        
        st.divider()
        
        if st.button("🗑️ Clear All & Start Over"):
            st.session_state.photos = []
            st.session_state.workout_plan = None
            st.session_state.detected_equipment = []
            st.rerun()
    
    # Main content
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.header("📸 Capture Your Environment")
        
        # Camera option
        st.subheader("Take a Photo Now")
        camera_photo = st.camera_input("Use your camera", key="camera")
        
        if camera_photo is not None:
            image = Image.open(camera_photo)
            # Create a unique filename
            image.filename = f"camera_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
            # Check if this photo is already added
            if not any(hasattr(p, 'filename') and p.filename == image.filename for p in st.session_state.photos):
                st.session_state.photos.append(image)
                st.success("📸 Photo captured!")
        
        st.divider()
        
        # File upload option
        st.subheader("Or Browse Your Photos")
        uploaded_files = st.file_uploader(
            "Upload photos from your gallery",
            type=["jpg", "jpeg", "png"],
            accept_multiple_files=True,
            help="Select multiple photos from your device"
        )
        
        if uploaded_files:
            for uploaded_file in uploaded_files:
                if not any(hasattr(p, 'filename') and p.filename == uploaded_file.name for p in st.session_state.photos):
                    image = Image.open(uploaded_file)
                    image.filename = uploaded_file.name
                    st.session_state.photos.append(image)
            st.success(f"✅ {len(st.session_state.photos)} photo(s) total")
        
        if st.session_state.photos:
            st.subheader("Your Photos")
            cols = st.columns(3)
            for idx, photo in enumerate(st.session_state.photos):
                with cols[idx % 3]:
                    st.image(photo, use_container_width=True)
                    if st.button(f"❌ Remove", key=f"remove_{idx}"):
                        st.session_state.photos.pop(idx)
                        st.rerun()
    
    with col2:
        st.header("🎯 Generate Workout")
        
        if not api_key:
            st.warning("⚠️ Please enter your Anthropic API key in the sidebar")
        elif not st.session_state.photos:
            st.info("📷 Upload at least one photo to get started")
        else:
            if st.button("🚀 Generate Workout Plan", type="primary"):
                if not any(workout_types.values()):
                    st.error("Please select at least one workout type")
                else:
                    with st.spinner("🔍 Analyzing your environment..."):
                        try:
                            result = analyze_environment(
                                st.session_state.photos,
                                fitness_level,
                                duration,
                                workout_types,
                                api_key
                            )
                            st.session_state.workout_plan = result
                            st.session_state.detected_equipment = result.get('equipment', [])
                            st.success("✅ Workout plan generated!")
                            st.rerun()
                        except Exception as e:
                            st.error(f"❌ Error: {str(e)}")
    
    # Display Results
    if st.session_state.workout_plan:
        st.divider()
        
        col1, col2, col3 = st.columns(3)
        with col1:
            pdf_buffer = generate_pdf(st.session_state.workout_plan, duration, fitness_level)
            st.download_button(
                label="📄 Download PDF",
                data=pdf_buffer,
                file_name=f"workout_{datetime.now().strftime('%Y%m%d')}.pdf",
                mime="application/pdf",
                use_container_width=True
            )
        with col2:
            if st.session_state.logged_in:
                make_public = st.checkbox("Make Public", value=False)
                if st.button("✅ Save Workout", use_container_width=True):
                    workout_id, share_code = save_workout_to_db(
                        st.session_state.user_id,
                        st.session_state.workout_plan,
                        fitness_level,
                        duration,
                        make_public
                    )
                    if share_code:
                        st.success(f"Saved! Share code: {share_code}")
                    else:
                        st.success("Workout saved to history!")
            else:
                if st.button("✅ Save Workout", use_container_width=True):
                    st.info("💾 Create an account to save your workouts!")
                    st.session_state.show_login_modal = True
                    st.rerun()
        with col3:
            if st.button("⏱️ Start Timer", use_container_width=True):
                st.info("Switch to Rest Timer tab!")
        
        st.divider()
        
        st.header("🎯 Detected Equipment")
        equipment_html = " ".join([f'<span class="equipment-tag">{item}</span>' 
                                   for item in st.session_state.detected_equipment])
        st.markdown(equipment_html, unsafe_allow_html=True)
        
        st.divider()
        
        st.header(f"Your {duration}-Minute Workout Plan")
        
        workout = st.session_state.workout_plan['workout']
        
        with st.expander("🔥 WARM-UP", expanded=True):
            for ex in workout['warmup']:
                st.markdown(f"""
                <div class="exercise-card">
                    <strong>{ex['name']}</strong> - <span style="color: #F97316;">{ex['duration']}</span><br>
                    <small>{ex['description']}</small>
                </div>
                """, unsafe_allow_html=True)
        
        with st.expander("💪 MAIN WORKOUT", expanded=True):
            for ex in workout['main']:
                st.markdown(f"""
                <div class="exercise-card">
                    <strong>{ex['name']}</strong> - <span style="color: #6366F1;">{ex['sets']} sets × {ex['reps']}</span><br>
                    <strong>Equipment:</strong> {ex['equipment']}<br>
                    <strong>Tips:</strong> {ex['tips']}
                </div>
                """, unsafe_allow_html=True)
        
        with st.expander("🧘 COOL-DOWN & STRETCH", expanded=True):
            for ex in workout['cooldown']:
                st.markdown(f"""
                <div class="exercise-card">
                    <strong>{ex['name']}</strong> - <span style="color: #10B981;">{ex['duration']}</span><br>
                    <small>{ex['description']}</small>
                </div>
                """, unsafe_allow_html=True)
        
        if st.session_state.workout_plan.get('notes'):
            st.warning(f"⚠️ **Important:** {st.session_state.workout_plan['notes']}")

with tab2:
    st.header("⏱️ Rest Timer")
    st.markdown("Track rest periods between sets")
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.subheader("Quick Presets")
        preset_col1, preset_col2, preset_col3 = st.columns(3)
        with preset_col1:
            if st.button("30s", use_container_width=True):
                st.session_state.timer_seconds = 30
        with preset_col2:
            if st.button("60s", use_container_width=True):
                st.session_state.timer_seconds = 60
        with preset_col3:
            if st.button("90s", use_container_width=True):
                st.session_state.timer_seconds = 90
        
        custom_time = st.number_input("Custom (seconds)", min_value=5, max_value=300, value=st.session_state.timer_seconds, step=5)
        st.session_state.timer_seconds = custom_time
        
        if st.session_state.timer_running:
            elapsed = time.time() - st.session_state.timer_start_time
            remaining = max(0, st.session_state.timer_seconds - int(elapsed))
            
            minutes = remaining // 60
            seconds = remaining % 60
            
            st.markdown(f'<div class="timer-display">{minutes:02d}:{seconds:02d}</div>', unsafe_allow_html=True)
            
            progress = (st.session_state.timer_seconds - remaining) / st.session_state.timer_seconds
            st.progress(progress)
            
            if remaining == 0:
                st.balloons()
                st.success("🎉 Rest complete!")
                st.session_state.timer_running = False
            else:
                time.sleep(0.1)
                st.rerun()
        else:
            minutes = st.session_state.timer_seconds // 60
            seconds = st.session_state.timer_seconds % 60
            st.markdown(f'<div class="timer-display">{minutes:02d}:{seconds:02d}</div>', unsafe_allow_html=True)
        
        btn_col1, btn_col2 = st.columns(2)
        with btn_col1:
            if not st.session_state.timer_running:
                if st.button("▶️ Start", type="primary", use_container_width=True):
                    st.session_state.timer_running = True
                    st.session_state.timer_start_time = time.time()
                    st.rerun()
            else:
                if st.button("⏸️ Stop", use_container_width=True):
                    st.session_state.timer_running = False
                    st.rerun()
        with btn_col2:
            if st.button("🔄 Reset", use_container_width=True):
                st.session_state.timer_running = False
                st.session_state.timer_start_time = None
                st.rerun()

with tab3:
    if not st.session_state.logged_in:
        show_login_prompt("Login to View Your Workout History", "history")
    else:
        st.header("📊 Workout History")
        
        workouts = get_user_workouts(st.session_state.user_id)
        
        if not workouts:
            st.info("No workouts yet. Complete a workout to see it here!")
        else:
            stats = get_user_stats(st.session_state.user_id)
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Total Workouts", stats['total_workouts'])
            with col2:
                st.metric("Total Exercises", stats['total_exercises'])
            with col3:
                st.metric("Total Minutes", stats['total_minutes'])
            
            st.divider()
            
            for workout in workouts:
                with st.expander(f"🏋️ {workout['date']} - {workout['duration']} min ({workout['fitness_level']})"):
                    st.write(f"**Exercises:** {workout['exercises']}")
                    st.write(f"**Equipment:** {', '.join(workout['equipment'][:5])}{'...' if len(workout['equipment']) > 5 else ''}")
                    
                    if workout['share_code']:
                        st.markdown(f'<div class="share-code">{workout["share_code"]}</div>', unsafe_allow_html=True)
                        st.caption("Share this code with others!")
                    
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        pdf_buffer = generate_pdf(workout['workout'], workout['duration'], workout['fitness_level'])
                        st.download_button(
                            "📄 PDF",
                            data=pdf_buffer,
                            file_name=f"workout_{workout['date'].replace(' ', '_')}.pdf",
                            mime="application/pdf",
                            key=f"dl_{workout['id']}"
                        )
                    with col2:
                        with st.popover("🤝 Share"):
                            search_query = st.text_input("Search username", key=f"search_{workout['id']}")
                            if search_query:
                                users = search_users(search_query)
                                for user_id, username in users:
                                    if user_id != st.session_state.user_id:
                                        if st.button(f"Share with {username}", key=f"share_{workout['id']}_{user_id}"):
                                            if share_workout_with_user(workout['id'], st.session_state.user_id, user_id):
                                                st.success(f"Shared with {username}!")
                    with col3:
                        if st.button("🗑️ Delete", key=f"del_{workout['id']}"):
                            delete_workout(workout['id'], st.session_state.user_id)
                            st.rerun()

with tab4:
    if not st.session_state.logged_in:
        show_login_prompt("Login to View Shared Workouts", "shared")
    else:
        st.header("🤝 Shared Workouts")
        
        col1, col2 = st.columns([2, 1])
        with col1:
            st.subheader("Workouts Shared With You")
            shared = get_shared_workouts(st.session_state.user_id)
            
            if not shared:
                st.info("No shared workouts yet.")
            else:
                for workout in shared:
                    with st.expander(f"From {workout['shared_by']} - {workout['date']} ({workout['duration']} min)"):
                        st.write(f"**Exercises:** {workout['exercises']}")
                        pdf_buffer = generate_pdf(workout['workout'], workout['duration'], workout['fitness_level'])
                        st.download_button(
                            "📄 Download PDF",
                            data=pdf_buffer,
                            file_name=f"shared_workout.pdf",
                            mime="application/pdf",
                            key=f"shared_{workout['id']}"
                        )
        
        with col2:
            st.subheader("Import by Code")
            import_code = st.text_input("Enter share code")
            if st.button("🔍 Import Workout"):
                if import_code:
                    workout = get_workout_by_share_code(import_code.upper())
                    if workout:
                        st.success(f"Found workout by {workout['created_by']}!")
                        pdf_buffer = generate_pdf(workout['workout'], workout['duration'], workout['fitness_level'])
                        st.download_button(
                            "📄 Download",
                            data=pdf_buffer,
                            file_name="imported_workout.pdf",
                            mime="application/pdf"
                        )
                    else:
                        st.error("Invalid share code")

with tab5:
    if not st.session_state.logged_in:
        show_login_prompt("Login to Access Settings", "settings")
    else:
        st.header("⚙️ Account Settings")
        
        st.subheader("Profile Information")
        current_email = get_user_email(st.session_state.username)
        st.write(f"**Username:** {st.session_state.username}")
        st.write(f"**Email:** {current_email or 'Not set'}")
        
        st.divider()
        
        st.subheader("Update Email")
        new_email = st.text_input("New email address", value=current_email or "")
        if st.button("Update Email"):
            update_email(st.session_state.user_id, new_email)
            st.success("Email updated!")
            st.rerun()
        
        st.divider()
        
        st.subheader("Change Password")
        current_password = st.text_input("Current password", type="password", key="current_pw")
        new_password = st.text_input("New password", type="password", key="new_pw")
        confirm_password = st.text_input("Confirm new password", type="password", key="confirm_pw")
        
        if st.button("Update Password"):
            if authenticate_user(st.session_state.username, current_password):
                if new_password == confirm_password and len(new_password) >= 6:
                    update_password(st.session_state.user_id, new_password)
                    st.success("Password updated!")
                else:
                    st.error("Passwords don't match or too short")
            else:
                st.error("Current password incorrect")
