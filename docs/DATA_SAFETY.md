# STUDYAI — Mobile App Store Data Safety & Privacy Disclosures

**Target Stores:** Google Play Store (Android App Bundle) & Apple App Store (iOS IPA)  
**Primary Category:** Education  
**Content Rating:** Everyone / 4+  
**Target Audience:** Students (Ages 10–18+), Parents, Teachers, School Administrators  

---

## 1. Google Play Data Safety Section Declarations

### Data Collected & Shared Table

| Data Type | Collected? | Shared with 3rd Parties? | Purpose | Ephemeral / Stored? | Optional / Required? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Name** | Yes | No | Account management, student profile | Stored securely | Required |
| **Email Address** | Yes | No | Authentication, password reset, notices | Stored securely | Required |
| **User IDs** | Yes | No | Multi-tenant school database isolation | Stored securely | Required |
| **Academic Performance** | Yes | No | Progress tracking, adaptive questions, grading | Stored securely | Required |
| **User Content (Notes/Drawings)** | Yes | No | Personal editable notebook, flashcards | Stored securely | Optional |
| **Crash Logs & Diagnostics** | Yes | No | Performance analysis, bug triage | Ephemeral / 30-day | Automatic |

### Security Practices
- **Data Encrypted in Transit**: All communication uses TLS 1.3 over HTTPS (`api.studyai.com`).
- **Data Encrypted at Rest**: PostgreSQL tables and storage buckets use AES-256 encryption.
- **Data Deletion Request**: Students and parents can submit in-app or web-based data deletion requests.
- **Children's Policy Compliance**: Complies with the Google Play Families Policy Requirements.

---

## 2. Apple App Store Privacy "Nutrition Labels" Declarations

### Data Used to Track You
- **None**: STUDYAI does not track students across apps or websites owned by other companies.

### Data Linked to the User
- **Contact Info**: Name, Email Address
- **User Content**: Student study notes, uploaded educational diagrams
- **Identifiers**: User ID
- **Usage Data**: Product interaction (topics studied, lessons viewed, quiz scores)
- **Diagnostics**: Crash data, performance data

### Data Not Linked to the User
- Aggregate platform analytics (e.g. system uptime, AI latency percentiles)
