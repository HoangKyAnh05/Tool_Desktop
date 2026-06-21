@echo off
cd /d "%~dp0"

:clean_corrupt
if exist "%~dp0app.ico" (
    for %%I in ("%~dp0app.ico") do (
        if %%~zI LSS 1000 (
            echo Found corrupted or 404 icon file, deleting...
            del "%~dp0app.ico"
        )
    )
)

if not exist "%~dp0app.ico" (
    echo Downloading atom icon from Source 1...
    curl -sL "https://raw.githubusercontent.com/electron/electron/master/shell/browser/resources/win/electron.ico" -o "%~dp0app.ico"
)

if exist "%~dp0app.ico" (
    for %%I in ("%~dp0app.ico") do (
        if %%~zI LSS 1000 del "%~dp0app.ico"
    )
)

if not exist "%~dp0app.ico" (
    echo Downloading atom icon from Source 2...
    curl -sL "https://raw.githubusercontent.com/electron/electron-quick-start/master/favicon.ico" -o "%~dp0app.ico"
)

if exist "%~dp0app.ico" (
    for %%I in ("%~dp0app.ico") do (
        if %%~zI LSS 1000 del "%~dp0app.ico"
    )
)

if not exist "%~dp0app.ico" (
    echo Source 1 and 2 failed, trying PowerShell backup...
    powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { (New-Object System.Net.WebClient).DownloadFile('https://raw.githubusercontent.com/electron/electron-quick-start/master/favicon.ico', '%~dp0app.ico') } catch {}"
)

set SCRIPT="%TEMP%\%RANDOM%-%RANDOM%.vbs"
echo Set fso = CreateObject("Scripting.FileSystemObject") > %SCRIPT%
echo scriptDir = "%~dp0" >> %SCRIPT%
echo Set oWS = CreateObject("WScript.Shell") >> %SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\DeskOS.lnk" >> %SCRIPT%
echo if fso.FileExists(sLinkFile) then fso.DeleteFile(sLinkFile) >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "wscript.exe" >> %SCRIPT%
echo oLink.Arguments = chr(34) ^& scriptDir ^& "run-silent.vbs" ^& chr(34) >> %SCRIPT%
echo oLink.WorkingDirectory = scriptDir >> %SCRIPT%
echo oLink.Description = "DeskOS & PC Optimizer Pro" >> %SCRIPT%
echo if fso.FileExists(scriptDir ^& "app.ico") then >> %SCRIPT%
echo     oLink.IconLocation = scriptDir ^& "app.ico" >> %SCRIPT%
echo else >> %SCRIPT%
echo     oLink.IconLocation = "C:\Windows\System32\shell32.dll,15" >> %SCRIPT%
echo end if >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%
echo Desktop shortcut 'DeskOS' created successfully!
pause
