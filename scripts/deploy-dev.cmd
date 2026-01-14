@echo off
chcp 65001

REM Проверка наличия необходимых переменных окружения
if "%DEPLOY_DEV_SSH_KEY%"=="" (
    echo [ОШИБКА] Не установлена переменная окружения DEPLOY_DEV_SSH_KEY
    echo Установите переменную окружения с путём к SSH-ключу, например:
    echo set DEPLOY_DEV_SSH_KEY=C:\Users\YourName\.ssh\id_rsa_dev
    exit /b 1
)

if "%DEPLOY_DEV_USER%"=="" (
    echo [ОШИБКА] Не установлена переменная окружения DEPLOY_DEV_USER
    echo Установите переменную окружения с именем пользователя, например:
    echo set DEPLOY_DEV_USER=user@server.com
    exit /b 1
)

if "%DEPLOY_DEV_REMOTE_FOLDER%"=="" (
    echo [ОШИБКА] Не установлена переменная окружения DEPLOY_DEV_REMOTE_FOLDER
    echo Установите переменную окружения с путём на сервере, например:
    echo set DEPLOY_DEV_REMOTE_FOLDER=/var/www/server/data
    exit /b 1
)

set KEY="%DEPLOY_DEV_SSH_KEY%"
set USER="%DEPLOY_DEV_USER%"
set REMOTE_FOLDER="%DEPLOY_DEV_REMOTE_FOLDER%"

echo Развертывание на DEV сервер...
echo Пользователь: %USER%
echo Папка: %REMOTE_FOLDER%

ssh -i %KEY% %USER% "rm -rf %REMOTE_FOLDER%/prayers.f7/*"
scp -r -i %KEY% ./dist/* %USER%:%REMOTE_FOLDER%/prayers.f7/
ssh -i %KEY% %USER% "find %REMOTE_FOLDER%/prayers.f7/ -type d -exec chmod 4755 {} \;"

echo Развертывание завершено!