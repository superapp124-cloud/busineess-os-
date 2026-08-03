# Windows EV Code Signing & Enterprise Distribution Guide

**Target Application**: CHATR Desktop (`chat.chatr.desktop`)  
**Standard**: DigiCert / Sectigo EV Authenticode (SHA256)  

---

## 1. Overview & Security Architecture

To ensure immediate Windows SmartScreen reputation and prevent untrusted binary alerts, production Windows installers (`chatr-desktop-setup.exe`) are signed using Extended Validation (EV) Code Signing certificates.

Key Security Rules:
- Private keys are **NEVER** stored or committed in source control.
- Signing certificates are injected via GitHub Actions CI secrets (`WIN_CSC_LINK` base64 string and `WIN_CSC_KEY_PASSWORD`).
- Local developer builds remain unsigned by default for rapid iteration.

---

## 2. CI/CD Environment Secrets Configuration

Set the following GitHub Repository Secrets:

| Secret Name | Description |
|---|---|
| `WIN_CSC_LINK` | Base64-encoded PFX/P12 certificate file |
| `WIN_CSC_KEY_PASSWORD` | Certificate private key password |
| `WIN_CSC_SUBJECT_NAME` | Certificate Subject Name string (e.g. `CN=CHATR Inc.`) |
| `WIN_CSC_SHA1` | Certificate thumbprint SHA1 hash |

---

## 3. Local Installer Verification

Run the signature verification script locally or post-build:
```bash
node scripts/verify-signed-installer.cjs
```
