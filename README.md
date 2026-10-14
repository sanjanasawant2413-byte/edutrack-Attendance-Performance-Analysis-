# EduTrack — Attendance & Performance Analysis

Enhanced school data-science project website.

## New features
- Dashboard KPIs
- Attendance vs performance scatter analysis
- Class-wise attendance comparison
- Top 5 performers
- At-risk student filter
- Student search
- Add student
- Edit student
- Delete student
- CSV export
- CSV import
- Printable report
- Dark/light theme toggle
- Attendance distribution and trend charts
- Subject performance comparison
- Performance distribution
- Attendance-performance correlation insights
- Data stored in browser localStorage
- Responsive laptop/mobile layout

## Run
Extract the ZIP and open `index.html` in Chrome/Edge/Firefox. Chart.js is loaded from CDN, so internet is required for charts.

## CSV import format
`Name,Class,Attendance,Mathematics,Science,English`

Example:
`Rahul Patil,9-A,88,76,82,79`

## Suggested project title
**Attendance and Performance Pattern Analysis in School**


## Daily attendance-taking feature
- Open **Attendance** from the left navigation.
- Choose an attendance date, subject, and class.
- Mark each student as Present or Absent, or use **Mark all present/absent**.
- Click **Save Attendance**. Records are stored in this browser using localStorage and remain available when the site is reopened in the same browser.
- Change the date or subject to maintain separate registers. This is a front-end demo; data is not synced between devices.
