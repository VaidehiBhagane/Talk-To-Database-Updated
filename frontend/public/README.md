# Talk to Database - AI Powered Multi-Department Data Query Platform

A full-stack application that enables non-technical users to query, visualize, and download data from multiple business units using natural language queries powered by Claude Sonnet 4.

## 🚀 Features

- **Natural Language Queries**: Ask questions in plain English, no SQL knowledge required
- **AI-Powered SQL Generation**: Groq Llama 3.3 converts natural language to optimized SQL queries
- **Multi-Department Support**: Isolated data access per business unit
- **Interactive Visualizations**: PowerBI-like charts and graphs using Plotly
- **Data Export**: Download results as CSV or Excel files
- **Admin Dashboard**: Comprehensive analytics and user management
- **JWT Authentication**: Secure role-based access control
- **Real-time Query Execution**: Fast and efficient data retrieval

## 🧩 Tech Stack

### Backend
- **Framework**: Flask (Python 3.12)
- **Database**: MySQL
- **AI Engine**: Groq Llama 3.3 70B
- **Authentication**: JWT (PyJWT)
- **ORM**: SQLAlchemy
- **Visualization**: Plotly
- **Data Processing**: Pandas

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **Charts**: Plotly.js, Recharts
- **HTTP Client**: Axios
- **Build Tool**: Vite

## 📁 Project Structure

```
TTD/
├── backend/
│   ├── app.py                  # Flask application entry point
│   ├── config.py               # Configuration management
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example           # Environment variables template
│   ├── models/
│   │   ├── user.py            # User model
│   │   ├── business_unit.py   # Business unit models
│   │   └── query_log.py       # Query logging model
│   ├── routes/
│   │   ├── auth_routes.py     # Authentication endpoints
│   │   ├── bu_routes.py       # Business unit endpoints
│   │   ├── query_routes.py    # Query execution endpoints
│   │   └── admin_routes.py    # Admin endpoints
	│   ├── services/
	│   │   ├── ai_sql_service.py  # Groq integration
	│   │   └── visualization_service.py  # Chart generation
│   └── utils/
│       ├── db_connect.py      # Database connection
│       └── jwt_utils.py       # JWT token management
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ChatbotPage.jsx
│   │   │   ├── VisualizationPage.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js         # API integration
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── database/
    └── schema.sql             # MySQL database schema

```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.12+
- Node.js 18+
- MySQL 8.0+
- Groq API Key

### Backend Setup

1. **Navigate to backend directory**
   ```powershell
   cd backend
   ```

2. **Create virtual environment**
   ```powershell
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```powershell
   Copy-Item .env.example .env
   # Edit .env file with your credentials
   ```

5. **Set up database**
   ```powershell
   # Run the schema.sql file in MySQL Workbench or command line
   mysql -u root -p < ..\database\schema.sql
   ```

6. **Run the Flask application**
   ```powershell
   python app.py
   ```
   Server will start at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```powershell
   cd ..\frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Create environment file** (optional)
   ```powershell
   echo "VITE_API_URL=http://localhost:5000" > .env
   ```

4. **Run development server**
   ```powershell
   npm run dev
   ```
   Application will open at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=talk_to_database

# JWT
JWT_SECRET_KEY=your_super_secret_jwt_key

# Groq API
GROQ_API_KEY=your_groq_api_key

# Flask
FLASK_ENV=development
SECRET_KEY=your_flask_secret_key
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📊 Database Schema

The application uses the following main tables:

- **users**: User accounts and authentication
- **business_units**: Department/BU definitions
- **user_bu_access**: User access permissions
- **query_logs**: Query history and analytics

Sample business unit schemas:
- **sales_dept**: Sales transactions and customer data
- **hr_dept**: Employee and attendance records
- **finance_dept**: Expenses and revenue tracking

## 🎯 Usage

### Default Admin Credentials
```
Username: admin
Password: Admin@123
```

### User Workflow

1. **Login/Signup**: Create an account or login
2. **Dashboard**: View accessible business units
3. **Select BU**: Click on a business unit to access its chatbot
4. **Query Data**: Type natural language questions
5. **View Results**: AI generates SQL, executes query, and shows insights
6. **Take Action**:
   - View data in tabular format
   - Visualize with interactive charts
   - Download as CSV/Excel

### Admin Workflow

1. **Access Admin Dashboard**: Click "Admin Dashboard" button
2. **View Analytics**: See platform-wide usage statistics
3. **Manage Business Units**: Create/edit/delete departments
4. **Grant Access**: Assign users to business units
5. **Monitor Activity**: Track query logs and performance

## 🔒 Security Features

- **Password Hashing**: bcrypt encryption
- **JWT Authentication**: Secure token-based auth
- **SQL Injection Protection**: Parameterized queries
- **Query Validation**: Only SELECT statements allowed
- **Role-Based Access**: User/Admin permissions
- **BU Isolation**: Users only access authorized data

## 📈 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

### Business Units
- `GET /api/bu/` - Get all accessible BUs
- `POST /api/bu/` - Create BU (Admin)
- `PUT /api/bu/:id` - Update BU (Admin)
- `DELETE /api/bu/:id` - Delete BU (Admin)

### Queries
- `POST /api/query/execute` - Execute natural language query
- `POST /api/query/visualize` - Generate visualization
- `POST /api/query/export` - Export data
- `GET /api/query/history` - Get query history

### Admin
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/admin/users` - All users
- `DELETE /api/admin/users/:id` - Delete user

## 🚀 Deployment

### Backend (Render/Railway)

1. Create new Web Service
2. Connect GitHub repository
3. Set environment variables
4. Deploy from `backend` directory
5. Command: `gunicorn app:app`

### Frontend (Vercel)

1. Import GitHub repository
2. Framework Preset: Vite
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Set `VITE_API_URL` environment variable

### Database (PlanetScale/ClearDB)

1. Create MySQL database instance
2. Import schema.sql
3. Update backend environment variables

## 🧪 Testing

### Backend
```powershell
# Activate venv
venv\Scripts\activate

# Test database connection
python -c "from utils.db_connect import test_connection; print(test_connection())"

# Run Flask app
python app.py
```

### Frontend
```powershell
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔄 Future Enhancements

- [ ] Voice query input (Whisper STT)
- [ ] Multi-language support
- [ ] PostgreSQL/MongoDB support
- [ ] Predictive ML insights
- [ ] Scheduled query notifications
- [ ] Query templates library
- [ ] Advanced chart customization
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error**
```powershell
# Check MySQL is running
Get-Service MySQL*

# Test connection
mysql -u root -p
```

**Module Import Errors**
```powershell
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Issues

**API Connection Error**
- Check `VITE_API_URL` in .env
- Ensure backend is running
- Verify CORS settings

**Build Errors**
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

## 📝 License

This project is created for educational and demonstration purposes.

## 👥 Support

For issues and questions:
- Create an issue in the repository
- Check documentation
- Review API responses in browser console

## 🙏 Acknowledgments

- Claude Sonnet 4 by Anthropic
- Material-UI component library
- Plotly visualization library
- Flask web framework
- React ecosystem

---

**Built with ❤️ using AI-powered technology**
