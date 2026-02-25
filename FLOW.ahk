#Requires AutoHotkey v2.0
; ═══════════════════════════════════════════════════════════════════════════
; FLOW Text Normalisierung — AutoHotkey Integration
; ═══════════════════════════════════════════════════════════════════════════
; 
; HOTKEY: Ctrl+Alt+P
; 
; WAS ES TUT:
; 1. Markiert den aktuellen Absatz (Cursor → Anfang)
; 2. Kopiert ihn in die Zwischenablage
; 3. Schreibt ihn nach input.txt
; 4. Führt Node.js aus (launcher.js)
; 5. Liest out.txt
; 6. Ersetzt den markierten Text
; 
; SETUP:
; - Dieses Skript im Projektordner speichern
; - Node.js muss installiert sein
; - Alle JS-Dateien müssen im selben Ordner liegen
; ═══════════════════════════════════════════════════════════════════════════

^!p:: {
    ; Pfade definieren
    scriptDir := A_ScriptDir
    inputFile := scriptDir . "\input.txt"
    outputFile := scriptDir . "\out.txt"
    nodeExe := scriptDir . "\ahk\node\node.exe"  ; Portable Node.js
    launcher := scriptDir . "\launcher.js"
    
    ; Text vom Cursor bis Absatzanfang markieren
    Send "^+{Home}"  ; Ctrl+Shift+Home
    Sleep 50
    
    ; In Zwischenablage kopieren
    Send "^c"
    if !ClipWait(1) {
        MsgBox "Fehler: Konnte Text nicht kopieren!", "FLOW Error", 48
        return
    }
    
    ; In input.txt schreiben
    try {
        if FileExist(inputFile)
            FileDelete inputFile
        FileAppend A_Clipboard, inputFile, "UTF-8"
    } catch as err {
        MsgBox "Fehler beim Schreiben von input.txt:`n" err.Message, "FLOW Error", 48
        return
    }
    
    ; Node.js ausführen
    cmd := '"' . nodeExe . '" "' . launcher . '"'
    try {
        RunWait cmd, scriptDir, "Hide"
    } catch as err {
        MsgBox "Fehler beim Ausführen von Node.js:`n" err.Message . "`n`nKommando: " . cmd, "FLOW Error", 48
        return
    }
    
    ; Ausgabe lesen
    if !FileExist(outputFile) {
        MsgBox "Fehler: out.txt wurde nicht erstellt!", "FLOW Error", 48
        return
    }
    
    try {
        processed := FileRead(outputFile, "UTF-8")
        
        ; Text ersetzen
        Send processed
        
        ; Erfolgs-Tooltip (optional)
        ToolTip "✅ FLOW: Text normalisiert"
        SetTimer () => ToolTip(), -2000  ; Nach 2 Sekunden ausblenden
        
    } catch as err {
        MsgBox "Fehler beim Lesen von out.txt:`n" err.Message, "FLOW Error", 48
    }
}

; ═══════════════════════════════════════════════════════════════════════════
; ZUSÄTZLICHE HOTKEYS (Optional)
; ═══════════════════════════════════════════════════════════════════════════

; Ctrl+Alt+T: Teste die Pipeline mit Beispieltext
^!t:: {
    testInput := "ich hab das gestern gelsen und dachte das wier villeicht schon ferig sind aber irgentwie hats sich nich so angefühlt"
    
    scriptDir := A_ScriptDir
    inputFile := scriptDir . "\input.txt"
    outputFile := scriptDir . "\out.txt"
    nodeExe := scriptDir . "\ahk\node\node.exe"
    
    FileDelete inputFile
    FileAppend testInput, inputFile, "UTF-8"
    
    RunWait '"' . nodeExe . '" "' . scriptDir . '\launcher.js"', scriptDir, "Hide"
    
    if FileExist(outputFile) {
        result := FileRead(outputFile, "UTF-8")
        MsgBox "INPUT:`n" . testInput . "`n`nOUTPUT:`n" . result, "FLOW Test", 64
    } else {
        MsgBox "Fehler: out.txt nicht erstellt!", "FLOW Test Error", 48
    }
}

; Escape: Beendet das Skript (Notfall)
^!x::ExitApp
