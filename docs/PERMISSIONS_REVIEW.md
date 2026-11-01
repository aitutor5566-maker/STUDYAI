# STUDYAI — Production Mobile Permissions Audit & Review

## 1. Principles of Least Privilege
STUDYAI strictly abides by minimal permission footprints for educational apps to protect child privacy and pass App Store / Google Play policy checks.

## 2. Declared Android Permissions (`AndroidManifest.xml`)

| Permission | Technical Justification | Risk Level |
| :--- | :--- | :--- |
| `android.permission.INTERNET` | Required to communicate with `api.studyai.com` for AI Tutor lesson synthesis, SVG diagram rendering, and real-time synchronisation. | Normal |
| `android.permission.ACCESS_NETWORK_STATE` | Required to detect offline states, pause synchronization, and avoid losing in-progress examination answers during network dropouts. | Normal |

### Explicitly Excluded / Forbidden Permissions
- `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`: **REJECTED**. Educational platform has no location requirement.
- `READ_CONTACTS` / `WRITE_CONTACTS`: **REJECTED**. No address book access allowed.
- `READ_SMS` / `RECEIVE_SMS`: **REJECTED**. Authentication uses direct email/TOTP.
- `RECORD_AUDIO` in background: **REJECTED**. Microphone is only accessed within foreground sessions during English conversation practice.

---

## 3. Declared iOS Info.plist Permissions

| Key | Purpose Description Shown to Student | Mandatory / Optional |
| :--- | :--- | :--- |
| `NSPhotoLibraryUsageDescription` | "STUDYAI requires photo library access to allow you to upload diagrams and notes for AI analysis." | Opt-in upon student tap |
| `NSCameraUsageDescription` | "STUDYAI requires camera access so you can photograph textbook pages to convert them into structured AI study notes." | Opt-in upon student tap |
| `NSMicrophoneUsageDescription` | "STUDYAI requires microphone access for conversational AI English practice and voice queries." | Opt-in upon student tap |

App Transport Security (`NSAppTransportSecurity`) has `NSAllowsArbitraryLoads: false`, strictly disallowing any unencrypted cleartext HTTP traffic.
