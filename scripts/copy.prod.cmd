chcp 65001
ssh -i "C:\\Users\\Владимир\\.ssh\\id_rsa_valaam" valaam_vladimir.ya@valaam.ru "rm -rf ./htdocs/prayers.f7/*"
scp -r -i "C:\\Users\\Владимир\\.ssh\\id_rsa_valaam" ./dist/* valaam_vladimir.ya@valaam.ru:/pub/home/valaam/htdocs/prayers.f7/