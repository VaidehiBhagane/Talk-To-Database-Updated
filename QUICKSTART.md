# Talk to Database - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Database Setup
1. Open MySQL Workbench
2. Run the SQL script:
   ```sql
   SOURCE C:/Users/nikhil.rokade_jadegl/Documents/TTD/database/schema.sql
   ```

### Step 2: Backend Setup
```powershell
# Navigate to backend
cd "C:\Users\nikhil.rokade_jadegl\Documents\TTD\backend"

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
Copy-Item .env.example .env

# IMPORTANT: Edit .env file with your credentials
# - Set your MySQL password
# - Add your OpenAI API key from https://platform.openai.com/api-keys

# Run the application
python app.py
```

Backend will run on: http://localhost:5000

### Step 3: Frontend Setup
Open a new PowerShell window:
```powershell
# Navigate to frontend
cd "C:\Users\nikhil.rokade_jadegl\Documents\TTD\frontend"

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on: http://localhost:3000

### Step 4: Login & Test

1. Open http://localhost:3000 in your browser
2. Login with default admin credentials:
   - **Username**: admin
   - **Password**: Admin@123

3. Try a sample query:
   - Click on "Sales Department"
   - Ask: "Show me all sales transactions"
   - Click "Execute Query"
   - View data, visualize, or download!

## 📋 Prerequisites Checklist

- [ ] Python 3.12 installed
- [ ] Node.js 18+ installed
- [ ] MySQL 8.0+ installed and running
- [ ] OpenAI API key
- [ ] Git (optional, for version control)

## 🔑 Getting OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Sign up or login
3. Go to API Keys section
4. Create new secret key
5. Copy the key and add to backend/.env file

## 🗄️ Database Credentials

Update `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=talk_to_database

OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

## ⚠️ Common Issues

### Backend won't start
- Check if MySQL is running: `Get-Service MySQL*`
- Verify database credentials in .env
- Ensure virtual environment is activated

### Frontend won't start
- Delete node_modules and reinstall: `Remove-Item -Recurse node_modules; npm install`
- Check if port 3000 is available

### Can't connect to API
- Ensure backend is running on port 5000
- Check firewall settings
- Verify CORS settings in backend/app.py

## 📱 Test the Application

### As User:
1. Signup with new credentials
2. Admin must grant you access to a business unit
3. Query data from your assigned department

### As Admin:
1. Login with admin credentials
2. Access Admin Dashboard
3. Create new business units
4. Grant users access to departments
5. View analytics and query logs

## 🎯 Sample Queries to Try

**Sales Department:**
- "Show me total sales by region"
- "What are the top 5 customers by revenue?"
- "Sales trends for this month"

**HR Department:**
- "List all active employees"
- "Show me employees by department"
- "Average salary by position"

**Finance Department:**
- "Total expenses by category"
- "Show pending expense approvals"
- "Revenue vs expenses comparison"

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Review error messages in browser console (F12)
- Check backend terminal for Python errors
- Verify all environment variables are set correctly

---

**Happy Querying! 🎉**
