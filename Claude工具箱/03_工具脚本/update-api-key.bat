@echo off
chcp 65001 >nul
echo ============================================
echo   DeepSeek API Key 更换工具
echo ============================================
echo.

set /p NEW_KEY="请输入你的新 API Key (sk-xxx): "

if "%NEW_KEY%"=="" (
    echo ❌ API Key 不能为空
    pause
    exit /b 1
)

echo.
echo 正在更新配置文件...

powershell -Command "
$json = Get-Content '%USERPROFILE%\.claude\settings.json' | ConvertFrom-Json
$env = $json.env
$env.ANTHROPIC_AUTH_TOKEN = '%NEW_KEY%'
$json.env = $env
$json | ConvertTo-Json -Depth 10 | Set-Content '%USERPROFILE%\.claude\settings.json'
"

if %errorlevel% equ 0 (
    echo.
    echo ✅ API Key 已成功更新！
    echo.
    echo 新的 API Key: %NEW_KEY:~0,10%...
    echo.
    echo 请关闭此窗口，然后重新运行 claude-fix.bat
) else (
    echo.
    echo ❌ 更新失败，请检查文件权限
)

echo.
pause
