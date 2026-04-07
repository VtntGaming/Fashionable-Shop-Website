function Get-ConfigValue {
    param(
        [Parameter(Mandatory = $true)][string]$Key,
        [string]$Default = ""
    )

    $envValue = [Environment]::GetEnvironmentVariable($Key)
    if (-not [string]::IsNullOrWhiteSpace($envValue)) {
        return $envValue
    }

    $candidateFiles = @(
        (Join-Path $PSScriptRoot "fashion-shop\.env.properties"),
        (Join-Path $PSScriptRoot ".env.properties")
    )

    foreach ($file in $candidateFiles) {
        if (-not (Test-Path $file)) {
            continue
        }

        $pattern = '^{0}=(.*)$' -f [regex]::Escape($Key)
        $match = Select-String -Path $file -Pattern $pattern | Select-Object -First 1
        if ($match) {
            return $match.Matches[0].Groups[1].Value.Trim()
        }
    }

    return $Default
}

function Get-MySqlExecutable {
    $candidates = @(
        (Get-ConfigValue -Key "MYSQL_BIN"),
        "C:\Program Files\MySQL\MySQL Server 9.5\bin\mysql.exe",
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
        "mysql"
    ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }

    foreach ($candidate in $candidates) {
        if ($candidate -eq "mysql") {
            if (Get-Command mysql -ErrorAction SilentlyContinue) {
                return "mysql"
            }
        }
        elseif (Test-Path $candidate) {
            return $candidate
        }
    }

    throw "MySQL CLI not found. Set MYSQL_BIN in fashion-shop/.env.properties or add mysql to PATH."
}

function Invoke-ConfiguredMySql {
    param([Parameter(Mandatory = $true)][string]$Sql)

    $mysqlExe = Get-MySqlExecutable
    $user = Get-ConfigValue -Key "SPRING_DATASOURCE_USERNAME" -Default "root"
    $password = Get-ConfigValue -Key "SPRING_DATASOURCE_PASSWORD"
    $database = Get-ConfigValue -Key "APP_DB_NAME" -Default "fashion_shop"

    $args = @("-u", $user)
    if (-not [string]::IsNullOrWhiteSpace($password)) {
        $args += "-p$password"
    }
    $args += @($database, "-e", $Sql)

    & $mysqlExe @args 2>$null
}
