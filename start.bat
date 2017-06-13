@echo off
title ML Notifier
mode con: cols=70 lines=30



set /p lurl=<url.txt
set /p ltempo=<tempo.txt
set /p lqtd=<qtd.txt

set /p url="URL (Ultimo = %lurl%): " || set url=%lurl%
set /p tempo="Tempo (segundos) (Ultimo = %ltempo%): " || set tempo=%ltempo%
set /p qtd="Qtd (Ultimo = %lqtd%): " || set qtd=%lqtd%

REM Usa-se essa sintaxe porque > pega um stream de numeros 0~9,
REM ou uma string. Quando eu dou %qtd%>qtx.txt ele acha que eu quero passar
REM a Stream de número Qtd (tipo, 3 para erro) e não a variavel
>url.txt echo %url%
>tempo.txt echo %tempo%
>qtd.txt echo %qtd%


node start.js %url% %tempo% %qtd%

pause