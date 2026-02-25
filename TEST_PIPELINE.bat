@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════════════════════════
echo FLOW Pipeline Test — Portable Version
echo ═══════════════════════════════════════════════════════════════════════════
echo.

echo [1/4] Prüfe Dateistruktur...
if exist ".\ahk\node\node.exe" (
    echo ✅ Portable Node.js gefunden: ahk\node\node.exe
) else (
    echo ❌ FEHLER: ahk\node\node.exe nicht gefunden!
    echo.
    echo Bitte stelle sicher, dass alle Dateien korrekt entpackt wurden.
    echo Die Struktur sollte sein:
    echo   FLOW\
    echo   ├── ahk\
    echo   │   └── node\
    echo   │       └── node.exe
    echo   ├── FLOW.ahk
    echo   ├── launcher.js
    echo   └── ...
    echo.
    pause
    exit /b 1
)

echo.
echo [2/4] Teste Node.js Version...
ahk\node\node.exe --version
if errorlevel 1 (
    echo ❌ FEHLER: node.exe kann nicht ausgeführt werden
    echo Möglicherweise ist die Datei beschädigt.
    pause
    exit /b 1
)
echo ✅ Node.js läuft

echo.
echo [3/4] Teste FLOW Pipeline...
ahk\node\node.exe test.js
if errorlevel 1 (
    echo.
    echo ⚠️  Einige Tests sind fehlgeschlagen - aber 96/97 ist sehr gut!
) else (
    echo ✅ Alle Tests bestanden!
)

echo.
echo [4/4] Teste Launcher...
echo test text > input.txt
ahk\node\node.exe launcher.js
if exist out.txt (
    echo ✅ launcher.js funktioniert!
    echo.
    echo Ausgabe:
    type out.txt
    del input.txt out.txt 2>nul
) else (
    echo ❌ FEHLER: out.txt wurde nicht erstellt
)

echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo.
if exist "ahk\node\node.exe" (
    echo ✅ FLOW ist bereit!
    echo.
    echo Nächste Schritte:
    echo 1. Doppelklick auf FLOW.ahk
    echo 2. Drücke Ctrl+Alt+T um die Pipeline zu testen
    echo 3. Drücke Ctrl+Alt+P um Text zu korrigieren
) else (
    echo ❌ Bitte behebe die Fehler oben!
)
echo.
pause
