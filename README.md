Ichishort – Production-Grade URL Shortener 🚀



Live Demo - https://ichishort-frontend.onrender.com/


Ichishort is a full-stack, production-ready URL shortener built with modern web technologies. Think of it like Bit.ly, but designed to showcase real-world backend, frontend, caching, and deployment skills. Perfect for your portfolio or interviews!




Features ✨

Custom short URLs / aliases

Analytics dashboard – track clicks and geolocation of users

JWT-based authentication – login & register securely

Redis caching – lightning-fast redirects

Responsive & clean UI – built with React + TailwindCSS




Tech Stack 🛠️

Frontend	Backend	Database	Cache	Deployment

React + Vite	Node.js + Express	MongoDB	Redis	Render / AWS / Cloud


Other libraries/tools: React Router, Axios, TailwindCSS, Recharts (for charts).




Getting Started 🚀

Prerequisites

Node.js (v18+) & npm

MongoDB instance

Redis server




Clone and Run

# Clone

git clone https://github.com/TheIchigoSimp/Ichishort.git

cd Backend

npm install

cp .env.example .env

# Update environment variables

npm run dev


cd ichishort-frontend

npm install

npm run dev


Visit http://localhost:5173

 for the frontend and try creating short URLs.




API Endpoints 🔗

Route	Method	Description

/api/auth/register	POST	Register a new user

/api/auth/login	POST	Login and get JWT token

/api/urls	POST	Create a new short URL

/:slug	GET	Redirect to the original URL

/health GET Health status




Deployment 🌐

Works with AWS EC2, Google Cloud Run, or Render

Redis caching ensures blazing fast redirects




Why Ichishort is Portfolio/Interview-Worthy 💼


Shows end-to-end full-stack skills (React + Node + MongoDB + Redis).

Demonstrates production-grade features like caching, JWT auth, analytics, and rate-limiting.

Clean, modern frontend architecture with routing, hooks, and reusable components.

Cloud exposure via deployment readiness.

Rate-limiting per IP or user.




Future Improvements 🚀

Add social login (Google, GitHub)

Advanced analytics (browser/device breakdown, charts)

Premium features (custom domains, password-protected links)
