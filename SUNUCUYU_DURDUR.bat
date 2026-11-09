@echo off
title Hemodiyaliz Unitesi Sunucusunu Durdur
cd /d "%~dp0"
chcp 65001 >nul

echo Hemodiyaliz sunucusu kapatiliyor...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo Sunucu basariyla durduruldu.
timeout /t 2 /nobreak >nul
exit
