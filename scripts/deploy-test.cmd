@echo off
chcp 65001

REM Проверка наличия необходимых переменных окружения
if "%DEPLOY_TEST_SSH_KEY%"=="" (
    echo [ОШИБКА] Не установлена переменная окружения DEPLOY_TEST_SSH_KEY
    echo Установите переменную окружения с путём к SSH-ключу, например:
    echo set DEPLOY_TEST_SSH_KEY=C:\Users\YourName\.ssh\id_rsa_test
    exit /b 1
)

if "%DEPLOY_TEST_REMOTE%"=="" (
    echo [ОШИБКА] Не установлена переменная окружения DEPLOY_TEST_REMOTE
    echo Установите переменную окружения с именем пользователя, например:
    echo set DEPLOY_TEST_REMOTE=user@server.com
    exit /b 1
)

if "%DEPLOY_TEST_REMOTE_FOLDER%"=="" (
    echo [ОШИБКА] Не установлена переменная окружения DEPLOY_TEST_REMOTE_FOLDER
    echo Установите переменную окружения с путём на сервере, например:
    echo set DEPLOY_TEST_REMOTE_FOLDER=/pub/home/test/htdocs/prayers.f7.test
    exit /b 1
)

set KEY="%DEPLOY_TEST_SSH_KEY%"
set REMOTE="%DEPLOY_TEST_REMOTE%"
set REMOTE_FOLDER="%DEPLOY_TEST_REMOTE_FOLDER%"

echo Развертывание на TEST сервер...
echo Пользователь: %REMOTE%
echo Папка: %REMOTE_FOLDER%

ssh -i %KEY% %REMOTE% "rm -rf %REMOTE_FOLDER%/*"
scp -r -i %KEY% ./dist/* %REMOTE%:%REMOTE_FOLDER%/
ssh -i %KEY% %REMOTE% "find %REMOTE_FOLDER%/ -type d -exec chmod 4750 {} \;"

echo Развертывание завершено!