@echo off
chcp 65001 >nul
echo ============================================
echo   DeepSeek API 连接测试工具
echo ============================================
echo.

echo [1/3] 读取当前配置...
powershell -Command "
try {
    $json = Get-Content '%USERPROFILE%\.claude\settings.json' -ErrorAction Stop | ConvertFrom-Json
    $token = $json.env.ANTHROPIC_AUTH_TOKEN
    $baseUrl = $json.env.ANTHROPIC_BASE_URL
    $model = $json.env.ANTHROPIC_MODEL
    
    Write-Host ✓ 配置文件读取成功
    Write-Host ''
    Write-Host ('API Base URL: ' + $baseUrl)
    Write-Host ('Model: ' + $model)
    Write-Host ('API Key: ' + $token.Substring(0, [Math]::Min(15, $token.Length)) + '...')
} catch {
    Write-Host ✗ 无法读取配置文件
    exit 1
}
"
if %errorlevel% neq 0 pause & exit /b 1

echo.
echo [2/3] 测试 API 连接...
powershell -Command "
try {
    $json = Get-Content '%USERPROFILE%\.claude\settings.json' | ConvertFrom-Json
    $token = $json.env.ANTHROPIC_AUTH_TOKEN
    $baseUrl = $json.env.ANTHROPIC_BASE_URL
    
    $headers = @{
        'x-api-key' = $token
        'anthropic-version' = '2023-06-01'
        'Content-Type' = 'application/json'
    }
    
    $body = @{
        model = 'deepseek-v4-flash'
        max_tokens = 10
        messages = @(@{role='user';content='Hi'})
    } | ConvertTo-Json -Depth 3
    
    $response = Invoke-RestMethod -Uri '$baseUrl/v1/messages' -Method Post -Headers $headers -Body $body -TimeoutSec 10
    
    Write-Host ('✓ API 连接成功！')
    Write-Host ('  响应状态: OK')
    Write-Host ('  模型响应: ' + $response.content[0].text.Substring(0, [Math]::Min(50, $response.content[0].text.Length)) + '...')
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 402) {
        Write-Host ('✗ 错误: 402 Insufficient Balance (余额不足)')
        Write-Host ''
        Write-Host '解决方案:'
        Write-Host '  1. 访问 https://platform.deepseek.com 充值'
        Write-Host '  2. 或更换其他 API Key'
        Write-Host '  3. 或使用其他 API 提供商'
    } elseif ($statusCode -eq 401) {
        Write-Host ('✗ 错误: 401 Unauthorized (API Key 无效)')
        Write-Host ''
        Write-Host '请检查你的 API Key 是否正确'
    } else {
        Write-Host ('✗ 错误: HTTP ' + $statusCode)
        Write-Host ('详情: ' + $_.Exception.Message)
    }
}
"

echo.
echo [3/3] 测试完成！
echo.
pause
