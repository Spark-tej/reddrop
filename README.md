# RedDrop — Page Workflows and Request Lifecycle

RedDrop is a MERN blood donation and blood-request application. This document describes the **implemented** page-to-database workflows. It is intentionally based on the current codebase, rather than planned endpoints that are not yet present.

## Architecture legend

All diagrams use the same colours:

- <span style="color:#2563eb">Blue</span> — React, Redux, and browser UI
- <span style="color:#ea580c">Orange</span> — Axios and Express API route
- <span style="color:#16a34a">Green</span> — middleware, controller, and business logic
- <span style="color:#7e22ce">Purple</span> — MongoDB / Mongoose model
- <span style="color:#ca8a04">Yellow</span> — JWT authentication or authorization
- <span style="color:#dc2626">Red</span> — validation or error response

> The frontend Axios base URL is configured in `frontend/src/api/axiosInstance.js`. In production it targets the Render API with the `/api` suffix.

## 1. Application startup and protected routes

On every app load, React restores an existing local session. Protected React routes then require `auth.isAuthenticated` before rendering.

```mermaid
flowchart TD
  A[React App mounts] --> B{reddrop_token in localStorage?}
  B -- Yes --> C[Axios GET /api/auth/me]
  C --> D[Express GET /auth/me]
  D --> E[JWT protect middleware]
  E --> F[Auth controller: getCurrentUser]
  F --> G[(MongoDB: Users)]
  G --> H[JSON: user]
  H --> I[Redux auth slice restores user]
  I --> J[ProtectedRoute renders Dashboard / Request pages]
  B -- No --> K[Public routes render]
  E --> L[401 JSON error]
  L --> M[Axios clears local session and redirects to Login]

  classDef frontend fill:#dbeafe,stroke:#2563eb,color:#172554;
  classDef api fill:#ffedd5,stroke:#ea580c,color:#7c2d12;
  classDef backend fill:#dcfce7,stroke:#16a34a,color:#14532d;
  classDef database fill:#f3e8ff,stroke:#7e22ce,color:#3b0764;
  classDef auth fill:#fef9c3,stroke:#ca8a04,color:#713f12;
  classDef error fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
  class A,B,C,H,I,J,K,M frontend;
  class D api;
  class F backend;
  class G database;
  class E auth;
  class L error;
```

## 2. Login page — `/login`

The Login page authenticates by **email and password**. The backend compares the submitted password with the bcrypt hash, issues a JWT, and also sets an HTTP-only cookie. Redux persists the token and user in local storage, then React navigates to the dashboard.

```mermaid
flowchart TD
  A[React Login form] --> B[Redux loginUser thunk]
  B --> C[Axios POST /api/auth/login]
  C --> D[Express POST /auth/login]
  D --> E[loginUser controller]
  E --> F[(MongoDB: find User by email)]
  F --> G{User exists and bcrypt password matches?}
  G -- Yes --> H[Generate JWT and set auth cookie]
  H --> I[JSON: user + token]
  I --> J[Redux auth slice stores token and user]
  J --> K[React navigates to /dashboard]
  G -- No / banned --> L[401 or 403 JSON error]
  L --> M[Redux error and toast]

  classDef frontend fill:#dbeafe,stroke:#2563eb,color:#172554;
  classDef api fill:#ffedd5,stroke:#ea580c,color:#7c2d12;
  classDef backend fill:#dcfce7,stroke:#16a34a,color:#14532d;
  classDef database fill:#f3e8ff,stroke:#7e22ce,color:#3b0764;
  classDef auth fill:#fef9c3,stroke:#ca8a04,color:#713f12;
  classDef error fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
  class A,B,C,I,J,K,M frontend;
  class D api;
  class E,G backend;
  class F database;
  class H auth;
  class L error;
```

## 3. Register page — `/register`

Registration is an OTP-first flow. No user is created until the submitted code is verified.

```mermaid
flowchart TD
  A[React Register form] --> B[Redux sendRegisterOtp thunk]
  B --> C[Axios POST /api/auth/send-register-otp]
  C --> D[Express POST /auth/send-register-otp]
  D --> E[OTP controller: validate email, generate six-digit code]
  E --> F[Hash OTP with bcrypt]
  F --> G[(MongoDB: Otp document with expiry)]
  G --> H[Mailer sends verification email]
  H --> I[JSON: OTP sent; demoCode only when OTP_DEMO_MODE=true]
  I --> J[React OTP modal opens]
  J --> K[User submits six-digit code]
  K --> L[Axios POST /api/auth/verify-register-otp]
  L --> M[Express POST /auth/verify-register-otp]
  M --> N[OTP controller checks expiry, attempts, and bcrypt match]
  N --> O[(MongoDB: Otp and Users)]
  O --> P[Create User; Mongoose hashes password]
  P --> Q[Mark OTP used and generate JWT]
  Q --> R[JSON: user + token]
  R --> S[Redux auth slice persists session]
  S --> T[React navigates to /dashboard]
  N --> U[400/429 JSON error]
  U --> V[Toast shows error; modal remains open]

  classDef frontend fill:#dbeafe,stroke:#2563eb,color:#172554;
  classDef api fill:#ffedd5,stroke:#ea580c,color:#7c2d12;
  classDef backend fill:#dcfce7,stroke:#16a34a,color:#14532d;
  classDef database fill:#f3e8ff,stroke:#7e22ce,color:#3b0764;
  classDef auth fill:#fef9c3,stroke:#ca8a04,color:#713f12;
  classDef error fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
  class A,B,C,I,J,K,L,R,S,T,V frontend;
  class D,M api;
  class E,F,H,N,P,Q backend;
  class G,O database;
  class Q auth;
  class U error;
```

**Timing:** OTP expiry and resend limits are configured in `backend/controllers/otpController.js`. The current values are one-minute expiry, 15-second resend delay, three resends, and five verification attempts.

## 4. Forgot Password page — `/forgot-password`

The reset flow uses the same `Otp` collection but a separate `reset` type. The API intentionally returns a generic success response for an unknown email, avoiding account enumeration.

```mermaid
flowchart TD
  A[React email form] --> B[Axios POST /api/auth/send-reset-otp]
  B --> C[Express POST /auth/send-reset-otp]
  C --> D[OTP controller finds user and creates reset OTP]
  D --> E[(MongoDB: Users and Otp)]
  E --> F[Mailer sends code; demoCode is optional in demo mode]
  F --> G[React OTP modal]
  G --> H[Axios POST /api/auth/verify-reset-otp]
  H --> I[Express POST /auth/verify-reset-otp]
  I --> J[OTP controller validates expiry and bcrypt match]
  J --> K[(MongoDB: mark OTP used)]
  K --> L[React shows new-password form]
  L --> M[Axios POST /api/auth/reset-password]
  M --> N[Express POST /auth/reset-password]
  N --> O[Controller sets password; Mongoose hashes it]
  O --> P[(MongoDB: update User)]
  P --> Q[JSON success]
  Q --> R[React redirects to /login]
  J --> S[400/429 JSON error and toast]

  classDef frontend fill:#dbeafe,stroke:#2563eb,color:#172554;
  classDef api fill:#ffedd5,stroke:#ea580c,color:#7c2d12;
  classDef backend fill:#dcfce7,stroke:#16a34a,color:#14532d;
  classDef database fill:#f3e8ff,stroke:#7e22ce,color:#3b0764;
  classDef error fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
  class A,B,F,G,H,L,M,Q,R frontend;
  class C,I,N api;
  class D,J,O backend;
  class E,K,P database;
  class S error;
```

## 5. Home page — `/`

The home page is public. It displays three static statistic cards and retrieves up to three urgent, open blood requests.

```mermaid
flowchart TD
  A[React Home useEffect] --> B[Redux fetchAllRequests thunk]
  B --> C[Axios GET /api/requests/all?urgency=Urgent&status=Open]
  C --> D[Express GET /requests/all]
  D --> E[Request controller builds urgency/status filter]
  E --> F[(MongoDB: BloodRequest find and sort)]
  F --> G[JSON: requests]
  G --> H[Redux bloodRequest.requests]
  H --> I[React renders first three urgent cards]
  E --> J[Error middleware JSON error]
  J --> K[Redux error state / empty UI]

  classDef frontend fill:#dbeafe,stroke:#2563eb,color:#172554;
  classDef api fill:#ffedd5,stroke:#ea580c,color:#7c2d12;
  classDef backend fill:#dcfce7,stroke:#16a34a,color:#14532d;
  classDef database fill:#f3e8ff,stroke:#7e22ce,color:#3b0764;
  classDef error fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
  class A,B,C,G,H,I,K frontend;
  class D api;
  class E backend;
  class F database;
  class J error;
```

## 6. Dashboard page — `/dashboard` (authenticated)

The dashboard makes two requests after `ProtectedRoute` allows entry: the signed-in user's requests and currently open requests in the user's city.

```mermaid
flowchart TD
  A[React Dashboard useEffect] --> B[Redux fetchMyRequests]
  A --> C[Redux fetchAllRequests with user city]
  B --> D[Axios GET /api/requests/my-requests with Bearer JWT]
  D --> E[JWT protect middleware]
  E --> F[Request controller: requesterId = req.user._id]
  F --> G[(MongoDB: BloodRequest)]
  C --> H[Axios GET /api/requests/all?city=...&status=Open]
  H --> I[Public request controller filter]
  I --> G
  G --> J[JSON request lists]
  J --> K[Redux updates myRequests and requests]
  K --> L[React renders eligibility, My Requests, nearby requests]

  classDef frontend fill:#dbeafe,stroke:#2563eb,color:#172554;
  classDef api fill:#ffedd5,stroke:#ea580c,color:#7c2d12;
  classDef backend fill:#dcfce7,stroke:#16a34a,color:#14532d;
  classDef database fill:#f3e8ff,stroke:#7e22ce,color:#3b0764;
  classDef auth fill:#fef9c3,stroke:#ca8a04,color:#713f12;
  class A,B,C,D,H,J,K,L frontend;
  class D,H api;
  class F,I backend;
  class G database;
  class E auth;
```

## 7. Find Donors page — `/search-donors`

```mermaid
flowchart TD
  A[React donor-search form] --> B[Redux searchDonors thunk]
  B --> C[Axios GET /api/users/donors?bloodType=&city=]
  C --> D[Express GET /users/donors]
  D --> E[User controller filters available, unbanned Donors]
  E --> F[(MongoDB: Users)]
  F --> G[JSON: donor summary fields]
  G --> H[Redux donor.donors]
  H --> I[React renders DonorCard results]
  E --> J[Error JSON]
  J --> K[Error text in UI]

  classDef frontend fill:#dbeafe,stroke:#2563eb,color:#172554;
  classDef api fill:#ffedd5,stroke:#ea580c,color:#7c2d12;
  classDef backend fill:#dcfce7,stroke:#16a34a,color:#14532d;
  classDef database fill:#f3e8ff,stroke:#7e22ce,color:#3b0764;
  classDef error fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
  class A,B,C,G,H,I,K frontend;
  class D api;
  class E backend;
  class F database;
  class J error;
```

## 8. Create Blood Request page — `/request-blood` (authenticated)

```mermaid
flowchart TD
  A[React request form] --> B[Redux createBloodRequest thunk]
  B --> C[Axios POST /api/requests/create with Bearer JWT]
  C --> D[Express POST /requests/create]
  D --> E[JWT protect middleware]
  E --> F[Request controller attaches requesterId]
  F --> G[(MongoDB: create BloodRequest)]
  G --> H[JSON: created request, HTTP 201]
  H --> I[Redux prepends request to request lists]
  I --> J[Toast and React navigates to /my-requests]
  E --> K[401 JSON error]
  F --> L[Validation/server error JSON]
  K --> M[Axios/Redux error and toast]
  L --> M

  classDef frontend fill:#dbeafe,stroke:#2563eb,color:#172554;
  classDef api fill:#ffedd5,stroke:#ea580c,color:#7c2d12;
  classDef backend fill:#dcfce7,stroke:#16a34a,color:#14532d;
  classDef database fill:#f3e8ff,stroke:#7e22ce,color:#3b0764;
  classDef auth fill:#fef9c3,stroke:#ca8a04,color:#713f12;
  classDef error fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
  class A,B,C,H,I,J,M frontend;
  class D api;
  class F backend;
  class G database;
  class E auth;
  class K,L error;
```

## 9. My Blood Requests page — `/my-requests` (authenticated)

This page loads the signed-in user's requests and lets the request owner (or an admin) update a request status.

```mermaid
flowchart TD
  A[React MyRequests useEffect] --> B[Axios GET /api/requests/my-requests]
  B --> C[JWT protect middleware]
  C --> D[Controller finds requests by req.user._id]
  D --> E[(MongoDB: BloodRequest)]
  E --> F[JSON: requests]
  F --> G[Redux myRequests update]
  G --> H[React renders cards]
  H --> I[Owner changes request status]
  I --> J[Axios PUT /api/requests/status/:id]
  J --> K[JWT middleware + owner/admin authorization]
  K --> L[(MongoDB: save request status)]
  L --> M[JSON: updated request]
  M --> N[Redux replaces request in both lists]
  N --> O[React refreshes card]
  K --> P[401/403/404 JSON error]

  classDef frontend fill:#dbeafe,stroke:#2563eb,color:#172554;
  classDef api fill:#ffedd5,stroke:#ea580c,color:#7c2d12;
  classDef backend fill:#dcfce7,stroke:#16a34a,color:#14532d;
  classDef database fill:#f3e8ff,stroke:#7e22ce,color:#3b0764;
  classDef auth fill:#fef9c3,stroke:#ca8a04,color:#713f12;
  classDef error fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
  class A,B,F,G,H,I,J,M,N,O frontend;
  class B,J api;
  class D backend;
  class E,L database;
  class C,K auth;
  class P error;
```

## 10. Active Blood Requests page — `/requests`

```mermaid
flowchart TD
  A[React AllRequests loads or submits filters] --> B[Redux fetchAllRequests thunk]
  B --> C[Axios GET /api/requests/all?status=Open&bloodType=&city=]
  C --> D[Express GET /requests/all]
  D --> E[Controller creates optional MongoDB filters]
  E --> F[(MongoDB: BloodRequest find sorted newest first)]
  F --> G[JSON: requests]
  G --> H[Redux bloodRequest.requests]
  H --> I[React renders RequestCard list]

  classDef frontend fill:#dbeafe,stroke:#2563eb,color:#172554;
  classDef api fill:#ffedd5,stroke:#ea580c,color:#7c2d12;
  classDef backend fill:#dcfce7,stroke:#16a34a,color:#14532d;
  classDef database fill:#f3e8ff,stroke:#7e22ce,color:#3b0764;
  class A,B,C,G,H,I frontend;
  class D api;
  class E backend;
  class F database;
```

## 11. Other application pages and supported API flows

| Page / feature | Current behaviour |
| --- | --- |
| `NotFound` | React-only fallback page; it makes no API request. |
| Logout | The Navbar dispatches the Redux `logout` reducer, which clears `reddrop_token` and `reddrop_user` from local storage. There is currently no `POST /api/auth/logout` endpoint or refresh-token store. |
| User profile update API | `PUT /api/users/profile` is implemented with JWT protection and updates the `User` document. There is no dedicated Profile or Edit Profile page in the current React routes. |
| Donation drives API | `GET /api/drives/active` and admin-only `POST /api/drives/create` are implemented, but no current frontend page calls them. |
| Notifications, posts/feed, chat, Socket.io, Cloudinary/Multer | These are **not implemented** in this codebase. They should not be presented as existing workflows until routes, controllers, models, and frontend pages are added. |

## Error handling lifecycle

Controllers throw errors through `express-async-handler`. The final error middleware returns `{ "message": "..." }` (and a stack trace only outside production). Axios thunks convert this to a rejected Redux action; pages display it as a toast or inline state.

```mermaid
flowchart LR
  A[Validation, auth, or database failure] --> B[Controller throws error]
  B --> C[Express errorHandler middleware]
  C --> D[HTTP JSON response: message]
  D --> E[Axios rejected promise]
  E --> F[Redux rejected action: error state]
  F --> G[React toast / error UI]

  classDef backend fill:#dcfce7,stroke:#16a34a,color:#14532d;
  classDef error fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
  classDef frontend fill:#dbeafe,stroke:#2563eb,color:#172554;
  class A,B backend;
  class C,D error;
  class E,F,G frontend;
```
