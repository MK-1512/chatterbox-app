# 💬 Chatterbox App

This is a **full-stack, real-time chat application** featuring a **Django backend with WebSockets** and a **React frontend**.  
It provides real-time communication, user authentication, and rich chat interactions designed for scalability and smooth performance.

---

## 🚀 Key Features

### ⚡ Real-time Chat  
- Built using **Django Channels** and **WebSockets** to provide instant message delivery between users.

### 🔐 User Authentication  
- Secure login and registration handled through **Django Rest Framework (DRF)** and **SimpleJWT** for token-based authentication.

### 💬 Rich Chat Features  
- **Typing Indicators:** Shows when another user is typing a message.  
- **Read Receipts:** Marks messages as read and updates status in the chat room.  
- **User Presence:** Tracks online/offline status and broadcasts real-time updates.  
- **Global Notifications:** A dedicated **NotificationConsumer** handles global alerts (e.g., notifying users of new messages even when outside the chat room).  

### 🧱 Scalable Backend  
- Uses **Redis** as the channel layer backend to support multiple concurrent WebSocket connections efficiently.

---

## 🧰 Technology Stack

### 🖥️ Backend
| Category | Technology |
|-----------|-------------|
| **Framework** | Django (v5+) |
| **API** | Django Rest Framework |
| **WebSockets** | Django Channels, Channels-Redis |
| **ASGI Server** | Daphne |
| **Database** | MySQL (`mysqlclient`) |
| **Authentication** | DRF SimpleJWT |

### 🌐 Frontend
| Category | Technology |
|-----------|-------------|
| **Framework** | React (Create React App) |
| **Routing** | React Router (`react-router-dom`) |
| **State Management** | React Context API (`AuthContext`, `GlobalSocketProvider`) |
| **Styling** | Bootstrap, React-Bootstrap |
| **Components** | `react-input-emoji` for chat input |

---

## 🔗 Links

- **Repository:** https://github.com/MK-1512/chatterbox-app  
- **Live Demo:** https://chatterbox-frontend-mk.onrender.com

---

## ⚙️ Setup and Installation

### 🛠️ Backend Setup

1. **Navigate to the backend directory:**
```bash
cd mk-1512/chatterbox-app/chatterbox-app-ca05bbc6f12d16f8465e12812cd4290423fd5d59/backend
```

2. **Create and activate a virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
- Create a `.env` file based on `.env.example` and update credentials (database, JWT secret, Redis config).

5. **Apply database migrations:**
```bash
python manage.py migrate
```

6. **Start the Django ASGI server:**
```bash
daphne -p 8000 chat_project.asgi:application
```

---

### 💻 Frontend Setup

1. **Open a new terminal and navigate to the frontend directory:**
```bash
cd mk-1512/chatterbox-app/chatterbox-app-ca05bbc6f12d16f8465e12812cd4290423fd5d59/frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the React development server:**
```bash
npm start
```

4. Open your browser and visit `http://localhost:3000` to view the app.

---

## 🧪 Notes & Usage Tips

- Ensure **Redis** is running before starting the backend for WebSocket connections.  
- Make sure **backend** (Daphne server) runs on port 8000 and **frontend** on port 3000.  
- Update `.env` for CORS and allowed hosts if deploying.  
- Run both frontend and backend simultaneously for full functionality.

---

## 👨‍💻 Author & Contact

**Mukesh Kumar J**  
- Email: mktech1512@gmail.com  
- LinkedIn: https://linkedin.com/in/mk2003  
- GitHub: https://github.com/MK-1512

---
