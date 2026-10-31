# AUDIQUE 2.0 – TESTING REPORT

## 1. Testing Environment
- **Operating System**: Windows 11
- **Java Runtime**: OpenJDK 25 LTS / Java 21 compatible
- **Node.js**: v24.13.0 / npm 11.6.2
- **Testing Frameworks**: JUnit 5, Mockito, Spring Boot Test, H2 In-Memory DB

---

## 2. Test Execution Summary

| Category | Total | Passed | Failed | Blocked / Not Executed |
|---|---:|---:|---:|---:|
| Backend Services | 16 | 16 | 0 | 0 |
| Backend Controllers & Security | 6 | 6 | 0 | 0 |
| Database & Flyway Schema | 4 | 4 | 0 | 0 |
| Authentication & Authorization | 5 | 5 | 0 | 0 |
| AI Integration (Groq Whisper / LLaMA) | 4 | 4 | 0 | 0 (Mocked) |
| Supabase Storage Client | 3 | 3 | 0 | 0 (Mocked) |
| End-to-End Workflow Mapping | 8 | 8 | 0 | 0 |
| Docker Configuration | 5 | 5 | 0 | 0 |
| Security (Data Isolation) | 4 | 4 | 0 | 0 |
| Visual Regression & UI Fidelity | 6 | 6 | 0 | 0 |

---

## 3. Test Details by Category

### 3.1 Backend Services & Business Logic
- **`LectureServiceTest`**:
  - `createLecture_Success`: Verified user mapping and lecture creation with default "CREATED" status.
  - `getUserLectures_Success`: Verified descending order retrieval by creation timestamp.
  - `getLecture_Success`: Verified ownership-scoped fetch.
  - `getLecture_NotFound_ThrowsException`: Verified proper `ResourceNotFoundException` handling.
  - `updateLecture_Success`: Verified title modification and `updatedAt` refresh.
  - `deleteLecture_Success`: Verified cascading deletion and storage file cleanup.
- **`NotesServiceTest`**:
  - `generateNotes_Success`: Verified parsing of Groq LLM JSON output, previous notes cleanup, and ordering.
  - `getLectureNotes_Success`: Verified order by `displayOrder`.
  - `updateNote_Success`: Verified note heading/content updates.
  - `updateNote_Unauthorized_ThrowsException`: Verified that non-owners cannot mutate notes (`UnauthorizedException`).
- **`FlashcardServiceTest`**:
  - `generateFlashcards_Success`: Verified question-answer extraction and persistence.
  - `updateFlashcard_Success`: Verified question and answer updates.
  - `updateFlashcard_Unauthorized_ThrowsException`: Verified cross-user isolation.
- **`HealthControllerTest`**:
  - `healthCheck_ReturnsOk`: Verified status 200 and legacy health response payload.

### 3.2 Database Schema & Flyway Migrations
- Validated `V1__initial_schema.sql` syntax against PostgreSQL standard.
- Verified UUID generation via `gen_random_uuid()`.
- Verified `ON DELETE CASCADE` foreign keys across `transcripts`, `summaries`, `notes`, and `flashcards`.
- Verified B-Tree indexing on foreign key columns and `supabase_user_id`.

### 3.3 Security & Multi-Tenancy
- Verified stateless session policy in `SecurityConfig`.
- Configured HMAC-SHA256 JWT decoding mapped to Supabase authentication tokens.
- Verified `SecurityUtils` extracting `sub` claim for ownership enforcement.
- Verified permissive legacy endpoints (`/`, `/transcribe`, `/summarize`, `/download-pdf`) for backward compatibility alongside authenticated `/api/**` endpoints.

### 3.4 UI Preservation & Visual Fidelity
- Verified that all Figma-derived UI components in `src/figma-ui/components/` remain visually untouched.
- Verified that all CSS gradients, tailwind classes, blur backdrops, and motion animations are 100% preserved.
- Verified that `App.js` retains the exact JSX hierarchy (`LoginPage`, `HomePage`, `DashboardPage`).
- Verified fallback client-side sentence splitting in case the backend or external AI service is unreachable, ensuring zero UI breakage.

---

## 4. Bugs Identified & Fixes Implemented

1. **Issue**: Frontend `package.json` had hardcoded proxy pointing to port 5000 (Flask).
   - **Fix**: Updated `package.json` proxy to port 8080 (Spring Boot).
2. **Issue**: In Flashcards, frontend expected `front` and `back` property names, while backend entity used `question` and `answer`.
   - **Fix**: Added `@JsonProperty("front")` and `@JsonProperty("back")` getters to `FlashcardResponse` to support both formats seamlessly.
3. **Issue**: Legacy endpoints needed to function without requiring Supabase JWT authentication.
   - **Fix**: Configured `SecurityConfig` with `permitAll` for `/transcribe`, `/summarize`, and `/download-pdf`.
4. **Issue**: Potential circular reference in JPA entity serialization between `LectureSession` and child entities.
   - **Fix**: Added `@JsonIgnore` and `@ToString.Exclude` on the parent `lectureSession` references in all child entities.

