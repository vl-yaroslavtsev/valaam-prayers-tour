@echo off
chcp 65001

REM Проверка наличия необходимых переменных окружения
if "%DEPLOY_PROD_SSH_KEY%"=="" (
    echo [ОШИБКА] Не установлена переменная окружения DEPLOY_PROD_SSH_KEY
    echo Установите переменную окружения с путём к SSH-ключу, например:
    echo set DEPLOY_PROD_SSH_KEY=C:\Users\YourName\.ssh\id_rsa_prod
    exit /b 1
)

if "%DEPLOY_PROD_USER%"=="" (
    echo [ОШИБКА] Не установлена переменная окружения DEPLOY_PROD_USER
    echo Установите переменную окружения с именем пользователя, например:
    echo set DEPLOY_PROD_USER=user@server.com
    exit /b 1
)

if "%DEPLOY_PROD_REMOTE_FOLDER%"=="" (
    echo [ОШИБКА] Не установлена переменная окружения DEPLOY_PROD_REMOTE_FOLDER
    echo Установите переменную окружения с путём на сервере, например:
    echo set DEPLOY_PROD_REMOTE_FOLDER=/var/www/server/data
    exit /b 1
)

set KEY="%DEPLOY_PROD_SSH_KEY%"
set USER="%DEPLOY_PROD_USER%"
set REMOTE_FOLDER="%DEPLOY_PROD_REMOTE_FOLDER%"

echo ======================================
echo ВНИМАНИЕ! Развертывание на PRODUCTION!
echo ======================================
echo Пользователь: %USER%
echo Папка: %REMOTE_FOLDER%
echo.
echo Нажмите Ctrl+C для отмены или любую клавишу для продолжения...
pause >nul

ssh -i %KEY% %USER% "rm -rf %REMOTE_FOLDER%/prayers.f7/*"
scp -r -i %KEY% ./dist/* %USER%:%REMOTE_FOLDER%/prayers.f7/
ssh -i %KEY% %USER% "find %REMOTE_FOLDER%/prayers.f7/ -type d -exec chmod 4755 {} \;"

echo Развертывание на PRODUCTION завершено!