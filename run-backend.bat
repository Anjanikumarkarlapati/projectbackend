@echo off
set JAVA_HOME=c:\tools\jdk21\jdk-21.0.2
set PATH=%JAVA_HOME%\bin;%PATH%
mvn clean spring-boot:run
