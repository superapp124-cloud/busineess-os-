; CHATR Desktop — NSIS Custom Installer Script
; Registers Windows Taskbar Shortcuts, Start Menu, and Workspace Folders

!include "MUI2.nsh"

!macro customInstall
  SetShellVarContext current
  CreateShortCut "$DESKTOP\CHATR OS.lnk" "$appExe" "" "$appExe" 0
  CreateShortCut "$SMPROGRAMS\CHATR OS.lnk" "$appExe" "" "$appExe" 0
!macroend

Section "Create CHATR Workspace Folders" SecFolders
  SetShellVarContext current
  
  CreateDirectory "$DOCUMENTS\CHATR Workspace"
  CreateDirectory "$DOCUMENTS\CHATR Workspace\Transcripts"
  CreateDirectory "$DOCUMENTS\CHATR Workspace\Call Recordings"
  CreateDirectory "$DOCUMENTS\CHATR Workspace\AI Summaries"
  
  FileOpen $0 "$DOCUMENTS\CHATR Workspace\README.txt" w
  FileWrite $0 "CHATR Workspace Folders$\r$\n"
  FileWrite $0 "========================$\r$\n$\r$\n"
  FileWrite $0 "Transcripts\$\r$\n"
  FileWrite $0 "  Live call transcripts are automatically saved here as .txt files.$\r$\n$\r$\n"
  FileWrite $0 "Call Recordings\$\r$\n"
  FileWrite $0 "  Audio/video call recordings are saved here as .webm or .mp4 files.$\r$\n$\r$\n"
  FileWrite $0 "AI Summaries\$\r$\n"
  FileWrite $0 "  AI-generated meeting summaries and action items are saved here.$\r$\n$\r$\n"
  FileWrite $0 "All data stays on your device. Nothing is uploaded to the cloud.$\r$\n"
  FileClose $0

SectionEnd
