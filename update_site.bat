@echo off
cd /d %~dp0
echo サイトの更新を開始します...
git add .
git commit -m "Update site: %date% %time%"
git push origin main
echo.
echo 完了しました！自動的に本番サイトのビルドが始まります。
pause