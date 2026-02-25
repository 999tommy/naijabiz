$envStr = Get-Content ".env.local" -Raw
$url = ""
$key = ""
$lines = $envStr -split "`n"
foreach ($line in $lines) {
    if ($line -match "^NEXT_PUBLIC_SUPABASE_URL=(.*)") { $url = $matches[1].Trim() }
    if ($line -match "^SUPABASE_SERVICE_ROLE_KEY=(.*)") { $key = $matches[1].Trim() }
}

$headers = @{
    "apikey" = $key
    "Authorization" = "Bearer $key"
    "Content-Type" = "application/json"
}
$mergeHeaders = @{
    "apikey" = $key
    "Authorization" = "Bearer $key"
    "Content-Type" = "application/json"
    "Prefer" = "resolution=merge-duplicates"
}

function Invoke-WithRetry {
    param($Uri, $Method, $Headers, $Body)
    $max = 5
    $delay = 2
    for ($i=0; $i -lt $max; $i++) {
        try {
            return Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -Body $Body -ErrorAction Stop
        } catch {
            Write-Host "Retry $($i+1)/$max for $Uri due to error: $_"
            Start-Sleep -Seconds $delay
        }
    }
    throw "Failed after $max retries for $Uri"
}

$fileData = node scripts/generate.js
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to generate mock data."; exit 1 }

$accounts = $fileData | ConvertFrom-Json
$count = 0

foreach ($acc in $accounts) {
    $count++
    $authBody = $acc.auth | ConvertTo-Json -Depth 10 -Compress
    
    # 1. Auth Create
    try {
        $authRes = Invoke-WithRetry -Uri "$url/auth/v1/admin/users" -Method Post -Headers $headers -Body $authBody
        $uid = $authRes.id
    } catch {
        Write-Host "Skipping account $($acc.user.business_name) - auth creation failed."
        continue
    }
    
    # 2. Public Users Upsert
    $userRow = $acc.user
    $userRow | Add-Member -Name "id" -Value $uid -MemberType NoteProperty
    $userBody = $userRow | ConvertTo-Json -Depth 10 -Compress
    
    try {
        $null = Invoke-WithRetry -Uri "$url/rest/v1/users?on_conflict=id" -Method Post -Headers $mergeHeaders -Body $userBody
    } catch {
        Write-Host "Failed to insert user row for $($acc.user.business_name)"
        continue
    }
    
    # 3. Products Insert
    $prods = $acc.products
    if ($prods.Count -gt 0) {
        foreach ($p in $prods) {
            $p | Add-Member -Name "user_id" -Value $uid -MemberType NoteProperty
        }
        $prodsBody = $prods | ConvertTo-Json -Depth 10 -Compress
        try {
            $null = Invoke-WithRetry -Uri "$url/rest/v1/products" -Method Post -Headers $headers -Body $prodsBody
        } catch {
            Write-Host "Failed to insert products for $($acc.user.business_name)"
        }
    }
    
    Write-Host "Created ($count/70) - $($userRow.business_name)"
    Start-Sleep -Milliseconds 500
}
Write-Host "DONE SEEDING 70 BUSINESSES!"
