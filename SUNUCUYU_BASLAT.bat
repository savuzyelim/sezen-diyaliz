@echo off
title Kocaeli Universitesi Hemodiyaliz Unitesi - Flask Sunucusu
cd /d "%~dp0"
chcp 65001 >nul

echo ======================================================================
echo   HEMODIYALIZ UNITESI - OTOMATIK IP FLASK SUNUCUSU BASLATILIYOR...
echo ======================================================================
echo.

:: Python Flask sunucusunu arka planda / penceresiz baslat
start /b python app.py

:: Sunucunun ayaga kalkmasi icin kisa bekleme
timeout /t 2 /nobreak >nul

:: Tarayicida ekranlari ac
start http://localhost:5000/sekreter.html
timeout /t 1 /nobreak >nul
start http://localhost:5000/display.html?tv=1

echo.
echo [BILGI] Flask Sunucusu Calisiyor! Port: 5000
echo Cihaz veya modem IP'si degisse bile otomatik baglanir.
echo.
exit
