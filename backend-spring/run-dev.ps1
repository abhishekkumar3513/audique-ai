# Audique 2.0 - Local Dev Runner (PowerShell)
param (
    [string]$Command = "spring-boot:run"
)

# 1. Detect and configure Java 21+ (Adoptium JDK 25 is installed)
$jdkCandidate = "C:\Program Files\Eclipse Adoptium\jdk-25.0.1.8-hotspot"
if (Test-Path $jdkCandidate) {
    $env:JAVA_HOME = $jdkCandidate
    $env:Path = "$jdkCandidate\bin;" + $env:Path
    Write-Host "[Audique] Using JDK: $jdkCandidate" -ForegroundColor Green
} else {
    Write-Host "[Audique] Using system JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Cyan
}

# 2. Check if Maven is available in PATH
$mvnCmd = Get-Command mvn -ErrorAction SilentlyContinue
if (-not $mvnCmd) {
    $localMavenDir = Join-Path $PSScriptRoot ".mvn\apache-maven-3.9.6"
    $localMavenBin = Join-Path $localMavenDir "bin\mvn.cmd"

    if (-not (Test-Path $localMavenBin)) {
        Write-Host "[Audique] Maven not found. Downloading Apache Maven 3.9.6..." -ForegroundColor Yellow
        $zipPath = Join-Path $PSScriptRoot ".mvn\maven.zip"
        $mavenUrl = "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"
        
        New-Item -ItemType Directory -Path (Join-Path $PSScriptRoot ".mvn") -Force | Out-Null
        Invoke-WebRequest -Uri $mavenUrl -OutFile $zipPath
        
        Write-Host "[Audique] Extracting Maven..." -ForegroundColor Yellow
        Expand-Archive -Path $zipPath -DestinationPath (Join-Path $PSScriptRoot ".mvn") -Force
        Remove-Item $zipPath -Force
    }

    $env:Path = (Join-Path $localMavenDir "bin") + ";" + $env:Path
    Write-Host "[Audique] Configured local Maven: $localMavenDir" -ForegroundColor Green
}

# 3. Execute Maven command
Write-Host "[Audique] Running: mvn $Command" -ForegroundColor Cyan
mvn $Command.Split(" ")

