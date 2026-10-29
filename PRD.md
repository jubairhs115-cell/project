# Product Requirements Document (PRD)

# University Library Book Borrowing and Returning System

| Item | Detail |
|---|---|
| Project type | University CSE project, full-stack web application |
| Version | 1.0 (final scope) |
| Date | 30 October 2026 |
| Stack | Next.js (App Router), JavaScript, MongoDB Atlas, MongoDB Node.js driver, Tailwind CSS, HeroUI (only if needed), Better Auth, Git and GitHub |

---

## 1. Purpose

Universities still track book loans with paper registers or spreadsheets. This causes lost records, unknown book availability, missed return dates, and disputes about fines.

This system replaces that with one web application where:

- A **student** can find a book, see instantly whether it is available, borrow it, track the due date, return it, and see any fine.
- An **admin (librarian)** can manage books and students, see every borrowing record, and manage fines from one dashboard.

## 2. Goals

1. **Correctness:** available copies are always accurate; a book is never borrowed when no copy is left.
2. **Simplicity of use:** a first-time student completes "find a book and borrow it" in under 30 seconds without instructions.
3. **Automation:** due dates, overdue detection, and fines are calculated by the system, never typed by hand.
4. **Configurability:** library rules (loan days, fine per day, borrow limit) change in one file, `config.json`, not in the code.
5. **Explainability:** the code stays simple enough for the student developer to explain fully in a viva.

## 3. Non-goals (out of scope for v1)

- Online payment of fines (admin records payment manually)
- Email or SMS notifications
- Book reservation queue and renewals
- Barcode or QR scanning
- E-books or file downloads
- Multiple libraries or branches
- Native mobile app (the web app is fully responsive instead)

## 4. Users and roles

| Role | Who | How they get the role |
|---|---|---|
| `student` | University student | Self-registers through the registration page |
| `admin` | Librarian | Created by a seed script or manually in the database; never selectable on the public registration form |

Rule: role checks always happen **on the server**. Hiding a button in the UI is only for user experience, never for security.

---

## 5. User experience strategy

The best everyday websites feel fast, clear, and forgiving. We apply that with concrete, testable rules.

### 5.1 UX principles and how we apply them

| Principle | What it means in this project |
|---|---|
| **Instant clarity** | Every book card shows a status badge: **Available (3 left)**, **Only 1 left**, or **Unavailable**. Colors are consistent across the whole app. |
| **Fewest steps** | Borrowing is one click on the book card or details page plus one confirmation. Returning is one click from "My Borrowed Books". |
| **Always show the next action** | The student dashboard shows due dates sorted by urgency, with labels like "Due in 2 days" or "Overdue by 3 days, fine 15 BDT". |
| **Fast search** | One search box on the books page searches title, author, and ISBN together. Category filter and availability filter sit beside it. The URL keeps the search (`/books?q=physics&category=Science`), so the page can be refreshed or shared. |
| **Every state is designed** | Each page has a loading state, an empty state ("No books match your search" with a clear-filters button), and an error state with a retry button. |
| **Immediate feedback** | After every action (borrow, return, save, delete) the user sees a clear success or error message, and the page updates without a manual refresh. |
| **Prevent mistakes** | Confirmation before delete and before return. Buttons are disabled with a visible reason (for example, "Already borrowed" or "Borrow limit reached"). Forms validate before sending. |
| **Human error messages** | "This book has no copies left." instead of "400 Bad Request". |
| **Mobile first** | Layout is designed for a phone screen first, then enlarged. Tables become stacked cards on small screens. Buttons are large enough to tap. |
| **Accessible by default** | Semantic HTML, labels on all inputs, visible keyboard focus, sufficient color contrast, and status never shown by color alone (badges also contain text). |
| **Consistency** | One navbar, one button style, one badge style, one message style. Same words for the same thing everywhere (always "Borrow", never "Issue" in one place and "Take" in another). |

### 5.2 Key screens, designed around the user's goal

**Student, "What do I need to do now?"**
Dashboard top row: Currently borrowed, Due soon, Overdue, Unpaid fine total. Below it, a list of borrowed books with the due date and a **Return** button.

**Student, "Find a book."**
Search bar first, filters second, results grid third. Each card has cover placeholder, title, author, category, status badge, and a Borrow button.

**Admin, "What needs my attention?"**
Dashboard top row: Total books, Available copies, Borrowed now, Total students, Overdue, Unpaid fines. Below it, the overdue list first, because that is the librarian's most urgent work.

### 5.3 Performance targets

- Pages respond in under 1 second on a normal connection with seeded data
- Book list uses **pagination** (page size from `config.json`), never loads every book at once
- Database indexes on searched fields (see section 8)

---

## 6. Configuration: `config.json`

All library rules live in one file so the application behavior can be changed without touching the code.

**Location:** `src/config/config.json`
**Import style:** `import config from "@/config/config.json";`

```json
{
  "library": {
    "name": "IU Central Library",
    "contactEmail": "library@example.com"
  },
  "borrowing": {
    "loanDays": 14,
    "maxActiveBorrowsPerStudent": 3,
    "blockBorrowWhenUnpaidFine": true
  },
  "fines": {
    "currency": "BDT",
    "perDay": 5,
    "graceDays": 0,
    "maxPerBook": 500
  },
  "books": {
    "categories": ["Computer Science", "Mathematics", "Physics", "Literature", "Islamic Studies", "General"],
    "pageSize": 12,
    "lowStockThreshold": 1
  },
  "ui": {
    "dueSoonDays": 3
  }
}
```

| Setting | Used for |
|---|---|
| `library.name` | Navbar title, page titles, footer |
| `borrowing.loanDays` | Due date = borrow date + this many days |
| `borrowing.maxActiveBorrowsPerStudent` | Maximum books a student can hold at once |
| `borrowing.blockBorrowWhenUnpaidFine` | If true, a student with an unpaid fine cannot borrow |
| `fines.perDay` | Fine = overdue days (after grace days) multiplied by this amount |
| `fines.graceDays` | Free days after the due date before the fine starts |
| `fines.maxPerBook` | Upper limit of fine for one borrowing |
| `books.categories` | Category dropdown in the book form and filter |
| `books.pageSize` | Books per page |
| `books.lowStockThreshold` | When the badge changes to "Only N left" |
| `ui.dueSoonDays` | A borrowing is shown as "Due soon" when this many days or fewer remain |

**Important separation:**

| File | Contains | Uploaded to GitHub? |
|---|---|---|
| `src/config/config.json` | Non-secret library rules | Yes |
| `.env.local` | Secrets: MongoDB connection string, Better Auth secret | **Never** |

A config change takes effect after the server restarts (or redeploys), because the file is read when the app starts.

---

## 7. Functional requirements

Priority: **M** = must have, **S** = should have.

### 7.1 Authentication (Stage 7)

| ID | Requirement | Priority |
|---|---|---|
| AUTH-1 | Student registers with name, student ID, email, and password | M |
| AUTH-2 | Student logs in with email and password | M |
| AUTH-3 | Admin logs in with the same login form; the role decides where they go after login (`/student/dashboard` or `/admin/dashboard`) | M |
| AUTH-4 | Logout ends the session | M |
| AUTH-5 | Session persists across page refreshes | M |
| AUTH-6 | Logged-out users who open a protected page are redirected to login, then returned to the page they wanted | S |
| AUTH-7 | Duplicate email or duplicate student ID is rejected with a clear message | M |
| AUTH-8 | Password minimum length is enforced | M |

### 7.2 Role-based authorization (Stage 8)

| ID | Requirement | Priority |
|---|---|---|
| ROLE-1 | Student pages and student APIs are accessible only to the `student` role | M |
| ROLE-2 | Admin pages and admin APIs are accessible only to the `admin` role | M |
| ROLE-3 | A student can only read and return **their own** borrowings | M |
| ROLE-4 | Unauthorized API calls return `401` (not logged in) or `403` (wrong role) | M |

### 7.3 Student features

| ID | Requirement | Priority |
|---|---|---|
| STU-1 | Dashboard with counts: borrowed now, due soon, overdue, unpaid fine total | M |
| STU-2 | Browse all books with pagination | M |
| STU-3 | Search by title, author, or ISBN; filter by category and availability | M |
| STU-4 | Book details page with description, category, ISBN, copies, status badge | M |
| STU-5 | Borrow a book | M |
| STU-6 | "My Borrowed Books" with due date and days remaining | M |
| STU-7 | Return a book | M |
| STU-8 | Borrowing history (all past and current borrowings) | M |
| STU-9 | Overdue and fine information, per book and as a total | M |

### 7.4 Admin features

| ID | Requirement | Priority |
|---|---|---|
| ADM-1 | Dashboard with statistics (section 7.7) | M |
| ADM-2 | Add a book | M |
| ADM-3 | Edit a book | M |
| ADM-4 | Delete a book (blocked if the book has active borrowings) | M |
| ADM-5 | View all books with search and filters | M |
| ADM-6 | View all students; view one student's borrowing history | M |
| ADM-7 | View all borrowing records with status filter | M |
| ADM-8 | View returned books | M |
| ADM-9 | View overdue books | M |
| ADM-10 | Manage fines: view unpaid fines, mark a fine as paid, waive a fine | M |
| ADM-11 | Admin can return a book on behalf of a student (for counter service) | S |

### 7.5 Borrowing rules (Stage 9)

When a student clicks **Borrow**, the server checks all of the following, in this order:

| # | Check | If it fails, message |
|---|---|---|
| 1 | User is logged in and is a student | "Please log in as a student." |
| 2 | Book exists | "Book not found." |
| 3 | `availableCopies` is greater than 0 | "This book has no copies left." |
| 4 | Student has no active borrowing of the **same book** | "You have already borrowed this book." |
| 5 | Student's active borrowings are fewer than `maxActiveBorrowsPerStudent` | "You have reached the borrow limit of N books." |
| 6 | If `blockBorrowWhenUnpaidFine` is true, student has no unpaid fine | "Please clear your unpaid fine first." |

If all checks pass:

1. Save `borrowDate` = now
2. Save `dueDate` = now + `loanDays`
3. Decrease `availableCopies` by 1
4. Create the borrowing with `status: "borrowed"`

**Concurrency safety:** the decrease in step 3 is done with one database operation that only succeeds if `availableCopies` is still greater than 0. This stops two students from taking the last copy at the same moment.

### 7.6 Returning and fine rules (Stages 10 and 11)

When a student (or admin) clicks **Return**:

1. Borrowing must exist, belong to the student, and have `status: "borrowed"`
2. Save `returnDate` = now
3. Increase `availableCopies` by 1
4. Calculate the fine
5. Set `status: "returned"`

**Overdue:** a borrowing is overdue when `status` is `"borrowed"` and the current time is later than `dueDate`. Overdue is **calculated, not stored**, so it can never go out of date.

**Fine formula:**

```
overdueDays = whole days after (dueDate + graceDays)    (minimum 0)
fineAmount  = min(overdueDays * perDay, maxPerBook)
```

- For books still borrowed, the fine is calculated live each time it is displayed.
- At return time, the final `fineAmount` is stored in the borrowing.
- If `fineAmount` is greater than 0, `fineStatus` becomes `"unpaid"`; otherwise `"none"`.
- Admin can change `fineStatus` to `"paid"` or `"waived"`.

**Decision: no separate `fines` collection.** The project needs only one fine per borrowing, so `fineAmount` and `fineStatus` stay inside `borrowings`. This keeps the database simple and the logic easy to explain. A `fines` collection would only be needed for multiple payments per fine or partial payment history, which is out of scope.

### 7.7 Reports and dashboard

| Statistic | How it is calculated |
|---|---|
| Total books | Count of book documents |
| Total copies | Sum of `totalCopies` |
| Available books | Sum of `availableCopies` |
| Borrowed books | Count of borrowings with `status: "borrowed"` |
| Total students | Count of users with `role: "student"` |
| Overdue books | Borrowed borrowings with `dueDate` earlier than now |
| Unpaid fine total | Sum of `fineAmount` where `fineStatus: "unpaid"` |
| Collected fine total | Sum of `fineAmount` where `fineStatus: "paid"` |

---

## 8. Database design (MongoDB Atlas)

Database name: `library_db`. Relationships use **ObjectId references** (a borrowing stores the `_id` of the user and the book).

### 8.1 `users`

Managed through Better Auth, extended with our own fields. Better Auth also keeps its own session and account records in the same database; we do not edit those by hand. The exact Better Auth setup is finalized in Stage 7.

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `name` | String | Required |
| `email` | String | Required, unique |
| `studentId` | String | Required for students, unique |
| `role` | String | `"student"` or `"admin"`; default `"student"` |
| `createdAt` | Date | Set on creation |

### 8.2 `books`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `title` | String | Required |
| `author` | String | Required |
| `isbn` | String | Required, unique |
| `category` | String | Must be in `config.books.categories` |
| `description` | String | Optional |
| `totalCopies` | Number | Integer, 1 or more |
| `availableCopies` | Number | Integer, from 0 to `totalCopies` |
| `createdAt` / `updatedAt` | Date | |

### 8.3 `borrowings`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `userId` | ObjectId | Reference to `users._id` |
| `bookId` | ObjectId | Reference to `books._id` |
| `borrowDate` | Date | Set at borrowing |
| `dueDate` | Date | `borrowDate + loanDays` |
| `returnDate` | Date or null | Set at return |
| `status` | String | `"borrowed"` or `"returned"` |
| `fineAmount` | Number | Final fine; 0 until returned |
| `fineStatus` | String | `"none"`, `"unpaid"`, `"paid"`, or `"waived"` |
| `bookTitle` | String | Copy of the title at borrowing time, so history stays readable even if the book is later edited |

### 8.4 Indexes

| Collection | Index | Why |
|---|---|---|
| `users` | `email` (unique), `studentId` (unique) | Prevent duplicates, fast login |
| `books` | `isbn` (unique) | Prevent duplicate books |
| `books` | text index on `title`, `author` | Fast search |
| `borrowings` | `userId` + `status` | Fast "my borrowed books" |
| `borrowings` | `bookId` + `status` | Fast "is this book still borrowed" |

### 8.5 Relationships

```
users (1) ────< borrowings >──── (1) books
```

One user can have many borrowings. One book can appear in many borrowings. Each borrowing connects exactly one user to one book.

---

## 9. API design

All APIs live under `src/app/api/` as Next.js Route Handlers. All responses are JSON. Errors use the same shape everywhere: `{ "error": "Readable message" }`.

### 9.1 Books

| Method | Path | Who | Purpose |
|---|---|---|---|
| GET | `/api/books` | Logged-in users | List books (query: `q`, `category`, `available`, `page`) |
| GET | `/api/books/[id]` | Logged-in users | One book |
| POST | `/api/books` | Admin | Add book |
| PUT | `/api/books/[id]` | Admin | Edit book |
| DELETE | `/api/books/[id]` | Admin | Delete book |

### 9.2 Borrowings

| Method | Path | Who | Purpose |
|---|---|---|---|
| POST | `/api/borrowings` | Student | Borrow a book (body: `bookId`) |
| GET | `/api/borrowings/my` | Student | Own borrowings (query: `status`) |
| PATCH | `/api/borrowings/[id]/return` | Student (own) or Admin | Return a book |
| GET | `/api/admin/borrowings` | Admin | All borrowings (query: `status`, `overdue`) |

### 9.3 Students and fines (admin)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/students` | List students |
| GET | `/api/admin/students/[id]` | One student with borrowing history |
| GET | `/api/admin/fines` | Borrowings with fines |
| PATCH | `/api/admin/fines/[borrowingId]` | Set `fineStatus` to `paid` or `waived` |

### 9.4 Statistics and configuration

| Method | Path | Who | Purpose |
|---|---|---|---|
| GET | `/api/stats/student` | Student | Dashboard numbers for the logged-in student |
| GET | `/api/admin/stats` | Admin | Admin dashboard numbers |
| GET | `/api/config` | Logged-in users | Public part of `config.json` (categories, currency, library name) for the UI |

Authentication endpoints (`/api/auth/...`) are provided by Better Auth.

### 9.5 Status codes used

| Code | Meaning in this project |
|---|---|
| 200 | Success |
| 201 | Created (new book, new borrowing) |
| 400 | Invalid input or a borrowing rule failed |
| 401 | Not logged in |
| 403 | Logged in but wrong role |
| 404 | Item not found |
| 409 | Conflict (duplicate ISBN, duplicate email) |
| 500 | Unexpected server error |

---

## 10. Pages and navigation

| Route | Page | Access |
|---|---|---|
| `/` | Landing page with library name, search shortcut, login and register buttons | Public |
| `/login` | Login | Public |
| `/register` | Student registration | Public |
| `/student/dashboard` | Student dashboard | Student |
| `/books` | Browse and search books | Logged in |
| `/books/[id]` | Book details | Logged in |
| `/student/borrowed` | Currently borrowed books | Student |
| `/student/history` | Borrowing history | Student |
| `/student/fines` | Overdue and fine information | Student |
| `/admin/dashboard` | Admin dashboard | Admin |
| `/admin/books` | Manage books (list, add, edit, delete) | Admin |
| `/admin/students` | Manage students | Admin |
| `/admin/borrowings` | All borrowing records (with returned and overdue tabs) | Admin |
| `/admin/fines` | Manage fines | Admin |

Navbar changes by role: students see Books, My Books, History, Fines; admins see Dashboard, Books, Students, Borrowings, Fines.

---

## 11. Project structure

```
library-system/
├── .env.local                  secrets (never on GitHub)
├── PRD.md
├── src/
│   ├── config/
│   │   └── config.json         library rules
│   ├── lib/
│   │   ├── mongodb.js          database connection
│   │   ├── auth.js             Better Auth setup
│   │   ├── session.js          helpers: get current user, require role
│   │   └── fines.js            overdue and fine calculation
│   ├── components/             shared UI: Navbar, BookCard, StatusBadge, Message
│   └── app/
│       ├── layout.js
│       ├── page.js
│       ├── login/
│       ├── register/
│       ├── books/
│       ├── student/
│       ├── admin/
│       └── api/
│           ├── auth/
│           ├── books/
│           ├── borrowings/
│           ├── admin/
│           ├── stats/
│           └── config/
```

**Architecture rule used in every stage:** *page (UI) → fetch → Route Handler (API) → helper in `lib/` → MongoDB.* Business rules live in the Route Handlers and `lib/` helpers, never inside React components.

---

## 12. Non-functional requirements

| Area | Requirement |
|---|---|
| Security | Passwords are hashed by Better Auth. Secrets only in `.env.local` and the hosting provider's environment settings. Role checked in every protected API. Input validated on the server even if the form also validates. |
| Reliability | Available copies stay correct under simultaneous requests (section 7.5). |
| Usability | Rules in section 5 hold on every page. |
| Responsiveness | Works from 360 px phone width to desktop. |
| Maintainability | Plain JavaScript, no unnecessary libraries, consistent folder structure, consistent API response shape. |
| Portability | One command (`npm install`) and one `.env.local` file are enough to run the project on another computer. |

---

## 13. Development plan

| Stage | Work | Done when |
|---|---|---|
| 1 | Next.js setup, Git, GitHub | Home page runs; code on GitHub |
| 2 | MongoDB Atlas setup | Cluster, database user, network access ready |
| 3 | MongoDB connection | App connects using `.env.local` |
| 4 | First API route | `GET /api/...` returns JSON |
| 5 | Books CRUD backend | Five book APIs work and are tested |
| 6 | Books frontend | Search, filter, pagination, forms, all UX states |
| 7 | Authentication | Register, login, logout, session |
| 8 | Roles | Student and admin protection on pages and APIs |
| 9 | Borrowing | All rules in section 7.5 |
| 10 | Returning | Return flow, copies restored |
| 11 | Fines | Formula in section 7.6, admin fine management |
| 12 | Admin dashboard | All statistics in section 7.7 |
| 13 | Testing | Test cases in section 14 pass |
| 14 | Deployment | Live public URL |
| 15 | Documentation | README, ER diagram, flowcharts, final report |

`config.json` is created in **Stage 5** (when books need categories and page size) and extended in Stages 9 and 11.

---

## 14. Acceptance criteria and test cases

| # | Scenario | Expected result |
|---|---|---|
| T1 | Student registers with an email already used | Rejected with a clear message |
| T2 | Student opens an admin page | Redirected or shown "403 not allowed" |
| T3 | Student borrows an available book | Borrowing created; `availableCopies` decreases by 1; due date is 14 days ahead (with default config) |
| T4 | Student borrows a book with 0 copies | Rejected; copies unchanged |
| T5 | Student borrows the same book twice | Second attempt rejected |
| T6 | Student borrows a 4th book (limit 3) | Rejected with limit message |
| T7 | Two students borrow the last copy at once | Exactly one succeeds |
| T8 | Student returns a book on time | Status `returned`; copies +1; fine 0 |
| T9 | Student returns a book 4 days late (5 BDT per day) | Fine is 20 BDT; `fineStatus` is `unpaid` |
| T10 | Late for 200 days | Fine capped at `maxPerBook` |
| T11 | Change `loanDays` to 7 in `config.json` and restart | New borrowings have a 7-day due date |
| T12 | Admin deletes a book with an active borrowing | Rejected |
| T13 | Admin marks a fine as paid | Student's unpaid total decreases; admin's collected total increases |
| T14 | Search "phys" on the books page | Matching books shown; URL contains the search; empty state shown when nothing matches |
| T15 | Open the app on a 360 px wide screen | No horizontal scrolling; all actions reachable |

The project is **complete** when all "M" requirements pass their tests, the app is deployed, and the documentation is submitted.

---

## 15. Deployment and documentation

- **Hosting:** Vercel for the Next.js app, MongoDB Atlas for the database
- **Environment variables** are entered in the Vercel project settings, never committed
- **Documentation deliverables:** README with setup steps, ER diagram, system flow diagram (borrow and return), API list, screenshots, and this PRD

## 16. Risks and decisions

| Risk or decision | Handling |
|---|---|
| Better Auth and our `users` fields must match | Finalized together in Stage 7 using Better Auth's documented MongoDB setup |
| Race condition on the last copy | Single conditional database update (section 7.5) |
| Fine calculation drift | Overdue is calculated from dates, never stored |
| Scope too large for the semester | "S" priority items are built last and may be dropped without breaking the system |
| Admin account creation | Seed script, never public registration |
