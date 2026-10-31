@echo off
REM Audique 2.0 - Local Dev Runner (Batch)

IF EXIST "C:\Program Files\Eclipse Adoptium\jdk-25.0.1.8-hotspot" (
    SET "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-25.0.1.8-hotspot"
    SET "PATH=C:\Program Files\Eclipse Adoptium\jdk-25.0.1.8-hotspot\bin;%PATH%"
    echo [Audique] Using JDK: C:\Program Files\Eclipse Adoptium\jdk-25.0.1.8-hotspot
)

powershell -ExecutionPolicy Bypass -File "%~dp0run-dev.ps1" %*

