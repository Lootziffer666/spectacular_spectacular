@echo off
setlocal

REM === Verzeichnis des Scripts ermitteln ===
set "BASE_DIR=%~dp0"

REM === Pfade relativ setzen ===
set "AHK_EXE=%BASE_DIR%ahk\AutoHotkey64.exe"
set "FLOW_SCRIPT=%BASE_DIR%FLOW.ahk"

REM === Existenz prüfen ===
if not exist "%AHK_EXE%" (
    echo AutoHotkey64.exe nicht gefunden:
    echo %AHK_EXE%
    pause
    exit /b
)

if not exist "%FLOW_SCRIPT%" (
    echo FLOW.ahk nicht gefunden:
    echo %FLOW_SCRIPT%
    pause
    exit /b
)

REM === FLOW starten ===
start "" "%AHK_EXE%" "%FLOW_SCRIPT%"

endlocal
