# AI HRIS Pro

An intelligent Human Resource Information System (HRIS) powered by the Google Gemini API to streamline recruitment, performance management, attendance, benefits, and data analytics. This project serves as a comprehensive demonstration of a modern, AI-enhanced HR management platform.

## Features

- **Role-Based Access Control**: Separate dashboard experiences for Administrators and Employees.
- **Employee Management**: A central database for all employee records, including personal details, contracts, and employment history.
- **AI-Powered Recruitment**:
  - Generate compelling job descriptions using AI.
  - Create structured, multi-week onboarding plans tailored to specific roles and departments.
- **Performance Management**:
  - Track scheduled performance reviews.
  - Use AI to generate balanced and constructive performance review summaries based on key achievements and areas for improvement.
- **Attendance & Leave**:
  - **For Employees**: View time records, schedules, and submit leave and overtime requests.
  - **For Admins**: A comprehensive dashboard to view daily attendance stats (present, late, on leave), manage leave/overtime approvals with an optional two-step workflow, and manage employee schedules.
  - **AI Leave Checker**: An AI assistant automatically checks leave balances and company holidays when a request is made, providing instant feedback.
- **Benefits Administration**:
  - **For Employees**: A read-only portal to view their annual health care allowance, remaining balance, and a history of claims.
  - **For Admins**: Full control over health care claims, including filing new claims on behalf of employees, editing existing claims, and approving/rejecting them. Balances are automatically recalculated on every change.
- **AI HR Assistant**: A built-in chatbot, powered by Gemini, trained to answer general HR policy questions and provide best-practice advice.
- **Reporting & Analytics**:
  - Visual charts for key HR metrics like department headcount and gender distribution.
  - **AI Data Analyst**: Generate sharp, actionable insights from your HR data with the click of a button.
- **System Settings**: Configure default leave policies, health care allowances, company holidays, and approval workflows.

## Getting Started

This application is designed to run in a self-contained environment where the necessary dependencies are managed.

### Prerequisites

- An environment that provides the Google Gemini API key as an environment variable (`process.env.API_KEY`).

### Running the Application

1. Ensure all the project files are loaded into the development environment.
2. The application should start automatically.
3. Use the default credentials to log in:
    - **Admin**: `admin@hr-core.com` / `password`
    - **Employee**: `john.doe@example.com` / `password`

## Technologies Used

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (`@google/genai`)
- **Charting**: Recharts
- **State Management**: React Context API
- **Persistence**: Browser `localStorage` for session and data persistence.
