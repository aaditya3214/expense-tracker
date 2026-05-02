# My Project: Advanced Expense Tracker

## 👤 My Information
*   **Student Name:** [Your Name]
*   **Project Title:** Advanced Expense Tracker & Smart Analytics
*   **Submitted to:** [Teacher's Name]

---

## 📝 What is this project about?
I built a website that helps people manage their money. It is more than just a simple list; it is a smart system that reads shopping receipts and creates colorful charts. It helps you see exactly where your money goes every month.

---

## 🚀 What are the main features?

### 1. **Smart Dashboard (The Home Page)**
The home page has 4 special "Counter Boxes" that update automatically:
*   **Total Expenses:** Shows exactly how much money you have spent in total.
*   **Highest Month:** Tells you which month you spent the most money.
*   **Most Spent On:** Shows the item you buy the most (like "Milk" or "Rice").
*   **Costliest Item:** Shows the single most expensive thing you ever bought.
*   **Charts:** Two big charts show your spending by month and your top 5 biggest expenses.

### 2. **Adding Expenses (Two Ways)**
*   **Typing manually:** A simple form where you can type in what you bought, the price, and the shop name.
*   **Uploading a File:** You can upload a **CSV file** from stores like **DMart** or **Star Bazaar**. The app is smart enough to read the file and add all the items to your list instantly.

### 3. **Vendor Explorer (Shop Analysis)**
*   The app keeps a list of every shop you visit (Vendors).
*   You can click on a shop to see every product you ever bought from there and how the prices changed.

### 4. **History & Reports**
*   **Search:** You can search for any item using the search bar.
*   **Filters:** You can filter by **Year** or **Month** to see old data.
*   **Reports:** You can print a clean report for your records or download everything as an Excel file.

---

## 🛠️ What tools did I use?
I used modern "Industry Standard" tools to build this:
*   **Laravel (PHP):** This is the main engine that stores the data and runs the calculations.
*   **React (JavaScript):** This makes the website feel fast and smooth.
*   **Inertia.js:** This is the bridge that connects Laravel and React.
*   **Tailwind CSS:** This is used to make the buttons, charts, and boxes look premium and modern.
*   **Recharts:** A special library used to draw the Bar and Pie charts.

---

## 📁 Project Folder Structure
*   **`app/Http/Controllers/DmartReceiptController.php`**: This is the most important file. It contains the logic for importing files and calculating expenses.
*   **`resources/js/pages/Dashboard.jsx`**: This file contains the code for the charts and the "Counter Boxes."
*   **`app/Models/`**: This folder defines how the "Expense" and "Vendor" data is structured.

---

## 👨‍🏫 Note for the Teacher
This project shows that I can handle **real-world data**. I wrote special code that can read store receipts, save them into a database, and then turn that raw data into useful charts and reports. It is a full-stack application that is secure and easy to use.

---
*Created by [Your Name] with help from Antigravity AI.*
