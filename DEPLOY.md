# Deployment Guide

This guide explains how to deploy your Class Scheduler application.

> [!WARNING]
> **Important Support Note**: This application uses a Python script (`scheduler.py`) to generate the schedule. **Standard Vercel deployment does NOT support running Python scripts via `child_process`**. 
>
> If you deploy to Vercel, the website will work, but **generating the schedule will fail** unless you configure a separate backend for the Python logic.

## 1. Web Deployment (Recommended)

The easiest way to deploy your Next.js application is using **Vercel**.

### Option A: Vercel (Easiest)
1.  Push your code to a GitHub repository (which you have already done).
2.  Go to [Vercel.com](https://vercel.com) and sign up/login.
3.  Click **"Add New..."** -> **"Project"**.
4.  Import your GitHub repository `class-schedule`.
5.  Vercel will automatically detect that it's a Next.js project.
6.  Click **Deploy**.
    - Your site will be live in a few minutes!

### Option B: Manual Production Run
If you want to run the production version on your own computer or server:

1.  Open your terminal in the project folder.
2.  Build the application:
    ```bash
    npm run build
    ```
3.  Start the production server:
    ```bash
    npm start
    ```
4.  Open `http://localhost:3000` in your browser.

## 2. Desktop Application (Electron)

Your project is configured as a hybrid Next.js + Electron app. 

### Building the Installer
To create a Windows installer (`.exe`):

1.  Run the distribution script:
    ```bash
    npm run electron-dist
    ```
2.  The installer will be created in the `dist` folder (e.g., `dist/AUTOPLANNER Setup 0.1.0.exe`).

> **Note:** The current Electron configuration loads the integrated Next.js server. Ensure the server handling logic in `main.js` matches your distribution needs (e.g., loading static files vs starting a local server process).
