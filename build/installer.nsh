; Script NSIS personalizado de XORA.
; Antes de desinstalar cierra los procesos que podrían mantener archivos
; bloqueados. El runtime puede dejar QEMU separado para acelerar el siguiente
; arranque, así que el desinstalador hace una limpieza final.

; Al finalizar la instalación se vuelve a crear el acceso directo de escritorio.
; NSIS sigue la ubicación real del escritorio aunque esté redirigida por OneDrive
; y la operación es idempotente.
!macro customInstall
  DetailPrint "Creando accesos directos de XORA…"
  CreateShortcut "$DESKTOP\XORA.lnk" "$INSTDIR\XORA.exe" "" "$INSTDIR\XORA.exe" 0 \
    SW_SHOWNORMAL "" "XORA — emulador Android ligero"
  CreateDirectory "$SMPROGRAMS\XORA"
  CreateShortcut "$SMPROGRAMS\XORA\XORA.lnk" "$INSTDIR\XORA.exe" "" "$INSTDIR\XORA.exe" 0 \
    SW_SHOWNORMAL "" "XORA — emulador Android ligero"
!macroend

!macro customUnInstall
  ; Elimina accesos directos de XORA y de versiones anteriores si quedaron.
  Delete "$DESKTOP\XORA.lnk"
  Delete "$DESKTOP\ApkStart.lnk"
  Delete "$SMPROGRAMS\XORA\XORA.lnk"
  Delete "$SMPROGRAMS\ApkStart\ApkStart.lnk"
  RMDir "$SMPROGRAMS\XORA"
  RMDir "$SMPROGRAMS\ApkStart"

  DetailPrint "Cerrando procesos residuales de XORA…"
  ; /F fuerza el cierre y /T incluye los procesos hijos. Si no existe, se ignora.
  nsExec::Exec 'taskkill.exe /F /T /IM XORA.exe'
  nsExec::Exec 'taskkill.exe /F /T /IM ApkStart.exe'
  nsExec::Exec 'taskkill.exe /F /T /IM qemu-system-x86_64.exe'
  nsExec::Exec 'taskkill.exe /F /T /IM qemu-system-i386.exe'
  nsExec::Exec 'taskkill.exe /F /T /IM emulator.exe'
  nsExec::Exec 'taskkill.exe /F /T /IM emulator-check.exe'
  nsExec::Exec 'taskkill.exe /F /T /IM adb.exe'
  nsExec::Exec 'taskkill.exe /F /T /IM netsimd.exe'
  ; Da tiempo a que los procesos liberen sus archivos.
  Sleep 1500
!macroend
