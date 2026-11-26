# ADB portátil

Extrae Android Platform-Tools en este directorio (debe aparecer `adb.exe`); XORA
lo usará como primera opción:

```
tools/platform-tools/
└─ adb.exe
```

Descarga: https://developer.android.com/tools/releases/platform-tools

Si este directorio está vacío, XORA prueba en este orden:

1. 设置中手动指定的 adb 路径
2. 本目录
3. `%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe`
4. La copia de ADB incluida en el runtime oficial de XORA
5. El PATH del sistema
