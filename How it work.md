# ✅ Learnova — Build Complete


## How to Run

### 1. Configure [server/.env](file:///Users/devanshpatel/Devansh/project/Learnova/server/.env)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/learnova"
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
PORT=5000
```

### 2. Run DB migration
```bash
cd server && npx prisma migrate dev --name init
```

### 3. Start servers
```bash
cd server && npm run dev   # :5000
cd client && npm run dev   # :5173
```
### kill all run server 
```bash
lsof -ti:5000,5173 | xargs kill -9
```


### 4. Visit
- Learner: http://localhost:5173/courses
- Register as **Instructor** → lands on `/admin/courses`
- Register as **Learner** → lands on `/courses`

### 5. for database see
cd server
npx prisma studio
