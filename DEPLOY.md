# Deployment Guide

This guide explains how to deploy your Class Scheduler application.

> [!WARNING]
> **Important Support Note**: This application uses a Python script (`scheduler.py`) to generate the schedule. **Standard Vercel deployment does NOT support running Python scripts via `child_process`**. 
>
> If you deploy to Vercel, the website will work (Authentication, Dashboard, Data Entry), but **generating the schedule may fail** unless you configure a separate backend for the Python logic.

## 1. Web Deployment (Vercel)

The easiest way to deploy your Next.js application is using **Vercel**.

### Step 1: Push to GitHub
Make sure your latest code is pushed to GitHub.

### Step 2: Import Project
1.  Go to [Vercel.com](https://vercel.com) and sign up/login.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository `class-schedule`.

### Step 3: Configure Environment Variables
**CRITICAL**: You must add the following Environment Variables in the Vercel Project Settings during import (or in Settings -> Environment Variables):

1.  **Client Keys** (Copy from your `.env.local`):
    - `NEXT_PUBLIC_FIREBASE_API_KEY`
    - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    - `NEXT_PUBLIC_FIREBASE_APP_ID`

2.  **Admin Keys**:
    - `FIREBASE_PROJECT_ID`: (Your project ID)
    - `FIREBASE_CLIENT_EMAIL`: (From service-account.json)
    - `FIREBASE_PRIVATE_KEY`: (Copy the **ENTIRE** string from service-account.json, including `-----BEGIN PRIVATE KEY-----` and `\n` characters)

### Step 4: Deploy
Click **Deploy**. Vercel will build your app and it should be live in a minute.

## 2. Desktop Application (Electron)

Your project is configured as a hybrid Next.js + Electron app. 

### Building the Installer
To create a Windows installer (`.exe`):

1.  Run the distribution script:
    ```bash
    npm run electron-dist
    ```
2.  The installer will be created in the `dist` folder (e.g., `dist/AUTOPLANNER Setup 0.1.0.exe`).
