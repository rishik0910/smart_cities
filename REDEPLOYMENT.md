# 🗄️ Database Redeployment & Reconnection Guide

This guide is for the AI assistant (or developer) to quickly spin up a new PostgreSQL database and reconnect it to the Smart Cities portal when the Render free database expires (after 90 days).

---

### Step 1: Create a New PostgreSQL Database
1. Go to your **Render Dashboard** -> **New** -> **PostgreSQL**.
2. Set the details:
   - **Name**: `smart-cities-db`
   - **Region**: Same region as your backend (e.g., Oregon or Singapore).
   - **Database Name**: `smart_cities`
   - **User**: `smart_admin`
3. Click **Create Database** (Select the **Free** tier).

---

### Step 2: Get the Connection URLs
Once the database is active, copy the **External Database URL** (used to connect from your local PC to run seeders) and the **Internal Database URL** (used by the Render backend).

---

### Step 3: Run SQL Schema Migrations
Connect to the new database and execute the SQL commands inside:
1. `database_schema.sql` (to create tables).
2. `backend/migration.sql` (to apply schema fixes, including adding the `state` column and updating `ward_id` to varchar).

---

### Step 4: Run Seeders
From your local terminal, run the following commands to populate the database with the 780+ districts of India and the default officers:
```bash
# Set your temporary local environment variable
$env:DATABASE_URL="your_new_external_database_url"

# Run the seeders
node backend/seed_india_districts.js
node backend/seed_officers.js
```

---

### Step 5: Update Backend Environment Variables on Render
1. Go to your **Render Dashboard**.
2. Click on your backend web service: **`smart-cities`** (or similar backend service name).
3. Go to **Environment** in the left sidebar.
4. Update the **`DATABASE_URL`** environment variable with the **new Internal Database URL** you copied in Step 2.
5. Click **Save Changes**.

Render will automatically rebuild and redeploy your backend. Your portal will be fully active and connected to the new database!
