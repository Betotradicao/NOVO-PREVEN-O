@echo off
cd /d "%~dp0.."

set MINIO_ROOT_USER=f0a02f9d4320abc34679f4742eecbad1
set MINIO_ROOT_PASSWORD=3e928e13c609385d81df326d680074f2d69434d752c44fa3161ddf89dcdaca55

echo Iniciando MinIO...
echo Usuario: %MINIO_ROOT_USER%
echo.
echo Console: http://localhost:9011
echo API: http://localhost:9010
echo.

InstaladorINTERNO\minio.exe server minio-data --console-address :9011 --address :9010
