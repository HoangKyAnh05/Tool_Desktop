@echo off
cd /d "%~dp0"
echo Cleaning up any leftover Git lock files...
if exist ".git\index.lock" del /q /f ".git\index.lock"

echo Purging heavy Git history containing node_modules...
if exist ".git" rd /s /q ".git"

echo Initializing fresh Git repository...
git init

echo Setting remote origin to https://github.com/HoangKyAnh05/Tool_Desktop.git...
git remote add origin https://github.com/HoangKyAnh05/Tool_Desktop.git
git branch -M main

echo Staging all changes (excluding node_modules via .gitignore)...
git add .

echo Committing clean files...
git commit -m "initial commit: DeskOS virtual desktop and PC optimizer"

echo Pushing clean files to GitHub (Force push to overwrite heavy history)...
git push -u origin main --force
echo Done!
pause
