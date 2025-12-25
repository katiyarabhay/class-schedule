# Class Scheduler Application - Codebase Explanation

This document provides a comprehensive overview of the **Class Scheduler** application. It serves as a guide to understanding the architecture, the technology stack, and the core scheduling logic.

---

## 1. Project Overview

The **Class Scheduler** is a hybrid desktop/web application designed to automatically generate timetables for educational institutions. It solves the complex problem of assigning teachers, subjects, and batches to classrooms and time slots while satisfying various constraints (e.g., no double-booking, load balancing).

### Key Features
- **Automated Scheduling**: Uses advanced constraint programming to find optimal schedules.
- **Interactive UI**: Drag-and-drop interface (in progress/planned) and visual timetable grids.
- **Desktop Capable**: Built with Electron to run as a native Windows application.
- **Modern Tech Stack**: React (Next.js) for the frontend, Python for the heavy computational logic.

---

## 2. Technology Stack

The project uses a powerful combination of technologies:

*   **Frontend**: [Next.js](https://nextjs.org/) (React Framework)
    *   Handles the User Interface, routing, and data display.
    *   Uses **TypeScript** for type safety.
    *   Styling: CSS Modules and global CSS variables.
*   **Backend / Logic**: Python
    *   **Google OR-Tools**: The `ortools` library is used for the Constraint Satisfaction Problem (CSP) solver. This is the "brain" of the scheduler.
    *   Custom scripts (`scripts/scheduler.py`) handle the data inputs and mathematical modeling.
*   **Desktop Wrapper**: [Electron](https://www.electronjs.org/)
    *   Wraps the Next.js web app into a `.exe` executable.
    *   Manages the lifecycle of the application on the desktop.

---

## 3. Architecture & Directory Structure

The codebase is organized as follows:

### Root Directory
*   `package.json`: Manages JavaScript dependencies (Next.js, React, Electron) and build scripts.
*   `electron/`: Contains the main process for the Electron desktop app (`main.js`).

### Source Code (`src/`)
*   `src/app`: The Next.js "App Router" directory.
    *   `page.tsx`: The main landing page/dashboard.
    *   `layout.tsx`: The common layout (navbar, fonts) wrapping all pages.
    *   `api/`: (If present) Internal API routes to handle requests.
    *   `batches/`, `teachers/`, `subjects/`: Sub-pages for managing specific data entities.
*   `src/lib`: Utility functions and state management (likely Zustand or Context API).
*   `src/components`: Reusable UI components (buttons, cards, timetable grids).

### Scripts (`scripts/`)
 This is where the core logic resides.
*   **`scheduler.py`**: The main script that takes JSON input (teachers, subjects, classrooms) and outputs a valid schedule.
*   `generate_sample_data.py`: A utility to create test data for development.
*   `requirements.txt`: Python dependencies (e.g., `ortools`).

---

## 4. Deep Dive: The Scheduling Algorithm (`scheduler.py`)

The heart of this application is the Python script `scripts/scheduler.py`. It uses a technique called **Constraint Programming (CP)**.

### How it Works (Step-by-Step)

#### Step 1: Input Processing
The script receives a JSON object via Standard Input (stdin). This JSON contains:
- `teachers`: List of teachers and their qualifications.
- `subjects`: List of subjects, credits (hours needed), and type (Theory/Lab).
- `batches`: Student groups.
- `classrooms`: Available rooms and their capacities.

#### Step 2: "Request" Generation
Before scheduling, the script calculates *what* needs to be scheduled. It creates **Requests** (or "Class Instances").
- For every batch and every subject they need, it calculates how many slots are required (based on `credits`).
- It assigns a teacher to each request (balancing the load so one teacher isn't overworked).
- *Example*: If "Batch A" needs "Math" (3 credits), it creates 3 distinct "Math Request" objects.

#### Step 3: Mathematical Modeling (Variables)
The script creates a logic model using `cp_model`. It defines **Boolean Variables** (True/False) answering the question:
> *"Does Request R happen on Day D, Period P, in Room Room?"*

If `x[r, d, p, room]` is **True**, that class is scheduled there. If **False**, it is not.

#### Step 4: Applying Constraints
The solver is given "rules" it cannot break:

1.  **Universal Assignment**: Every request MUST be scheduled exactly once (output sum == 1).
2.  **Room Conflict**: A room cannot host more than 1 class at the same time.
3.  **Teacher Conflict**: A teacher cannot teach more than 1 class at the same time.
4.  **Batch Conflict**: A student batch cannot attend more than 1 class at the same time.
5.  **Room Suitability**: A class can only be scheduled in a room that fits the students (Capacity check).
6.  **Load Distribution**: (Implemented in `add_max_consecutive_constraints`) A batch/teacher should not have more than 2 consecutive classes without a break.

#### Step 5: Solving
The `CP-SAT` solver runs through millions of possibilities to find a combination of `True/False` values that satisfies ALL the rules above.

#### Step 6: Output
The result is converted back into a JSON list of scheduled classes (`final_schedule`) and printed to Standard Output (stdout), which the Next.js frontend reads and displays.

---

## 5. How to Run

1.  **Install Dependencies**:
    ```bash
    npm install
    pip install -r scripts/requirements.txt
    ```
2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
3.  **Generate Schedule**:
    - The frontend triggers the Python script.
    - Or manually: `python scripts/scheduler.py < data.json`

---

## 6. Future Improvements

*   **Soft Constraints**: Adding preferences (e.g., "Mrs. Smith prefers mornings") which are desirable but not mandatory.
*   **Gap Handling**: Minimizing gaps between classes for students.
*   **Lab Scheduling**: Handling multi-period blocks for science labs.

