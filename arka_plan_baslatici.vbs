Set WshShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' 1. Python Flask sunucusunu penceresiz (arka planda gizli - 0 parametresi) başlat
WshShell.Run "python """ & strPath & "\app.py""", 0, False

' 2. Sunucunun ayağa kalkması için 2 saniye bekle
WScript.Sleep 2000

' 3. Varsayılan tarayıcıda Sekreter ve TV Bekleme ekranlarını aç
WshShell.Run "http://localhost:5000/sekreter.html"
WScript.Sleep 800
WshShell.Run "http://localhost:5000/display.html?tv=1"
