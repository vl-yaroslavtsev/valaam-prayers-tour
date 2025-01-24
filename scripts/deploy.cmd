@echo off
chcp 65001

set KEY="C:\Users\Владимир\.ssh\id_rsa_valaam"
set REMOTE="valaam_vladimir.ya@valaam.ru"

ssh -i %KEY% %REMOTE% "rm -rf /pub/home/valaam/htdocs/prayers.f7/*"
scp -r -i %KEY% ./dist/* %REMOTE%:/pub/home/valaam/htdocs/prayers.f7/
ssh -i %KEY% %REMOTE% "find /pub/home/valaam/htdocs/prayers.f7/ -type d -exec chmod 4750 {} \;"