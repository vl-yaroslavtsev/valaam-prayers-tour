@echo off
chcp 65001

set KEY="C:\Users\Владимир\.ssh\id_rsa_valaam_ru"
set USER="valaam.ru@valaam.ru"
set REMOTE_FOLDER="/var/www/valaam.ru/data"

ssh -i %KEY% %USER% "rm -rf %REMOTE_FOLDER%/prayers.f7/*"
scp -r -i %KEY% ./dist/* %USER%:%REMOTE_FOLDER%/prayers.f7/
ssh -i %KEY% %USER% "find %REMOTE_FOLDER%/prayers.f7/ -type d -exec chmod 4755 {} \;"