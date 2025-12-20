/**
 * Intelbras NetSDK FFI Wrapper para Node.js
 * Documentação: NetSDK Programming Guide
 */

import * as ffi from 'ffi-napi';
import * as ref from 'ref-napi';
import * as path from 'path';
import * as os from 'os';

// ============================================================================
// TIPOS BÁSICOS
// ============================================================================

const LLONG = ref.types.int64;
const LDWORD = ref.types.int64;
const DWORD = ref.types.uint32;
const WORD = ref.types.uint16;
const BYTE = ref.types.uint8;
const BOOL = ref.types.int32;
const LONG = ref.types.int32;

// Ponteiros
const LLONGPtr = ref.refType(LLONG);
const IntPtr = ref.refType(ref.types.int);
const VoidPtr = ref.refType(ref.types.void);
const CharPtr = ref.types.CString;

// ============================================================================
// ESTRUTURAS
// ============================================================================

/**
 * Estrutura de informações do dispositivo
 */
const NET_DEVICEINFO_Ex = ref.types.void; // Simplified - você pode expandir isso

/**
 * Callback de desconexão
 */
const fDisConnect = ffi.Function(ref.types.void, [
  LLONG,     // lLoginID
  CharPtr,   // pchDVRIP
  LONG,      // nDVRPort
  LDWORD     // dwUser
]);

// ============================================================================
// ENUMS
// ============================================================================

enum EM_LOGIN_SPAC_CAP_TYPE {
  EM_LOGIN_SPEC_CAP_TCP = 0,              // TCP login
  EM_LOGIN_SPEC_CAP_ANY = 1,              // Auto mode
  EM_LOGIN_SPEC_CAP_SERVER_CONN = 2,      // Actively register
  EM_LOGIN_SPEC_CAP_MULTICAST = 3,        // Multicast
  EM_LOGIN_SPEC_CAP_UDP = 4,              // UDP
  EM_LOGIN_SPEC_CAP_MAIN_CONN_ONLY = 6,   // Only main connection
  EM_LOGIN_SPEC_CAP_SSL = 7,              // SSL
  EM_LOGIN_SPEC_CAP_INTELLIGENT_BOX = 9,  // Intelligent box
  EM_LOGIN_SPEC_CAP_NO_CONFIG = 10,       // Not config connection
  EM_LOGIN_SPEC_CAP_U_LOGIN = 11,         // Utmp login
  EM_LOGIN_SPEC_CAP_LDAP = 12,            // LDAP
  EM_LOGIN_SPEC_CAP_AD = 13,              // AD
  EM_LOGIN_SPEC_CAP_RADIUS = 14,          // Radius
  EM_LOGIN_SPEC_CAP_SOCKET_5 = 15,        // Socket5
  EM_LOGIN_SPEC_CAP_CLOUD = 16,           // Cloud login
  EM_LOGIN_SPEC_CAP_AUTH_TWICE = 17,      // Auth twice
  EM_LOGIN_SPEC_CAP_TS = 18,              // TS stream
  EM_LOGIN_SPEC_CAP_P2P = 19,             // P2P
  EM_LOGIN_SPEC_CAP_MOBILE = 20,          // Mobile
  EM_LOGIN_SPEC_CAP_INVALID = 21          // Invalid
}

enum DH_RealPlayType {
  DH_RType_Realplay = 0,                  // Real-time preview
  DH_RType_Multiplay = 1,                 // Multi-play
  DH_RType_Realplay_0 = 2,                // Real-time monitor-main stream
  DH_RType_Realplay_1 = 3,                // Real-time monitor-extra stream 1
  DH_RType_Realplay_2 = 4,                // Real-time monitor-extra stream 2
  DH_RType_Realplay_3 = 5,                // Real-time monitor-extra stream 3
  DH_RType_Multiplay_1 = 6,               // Multi-play-1
  DH_RType_Multiplay_2 = 7,               // Multi-play-2
  DH_RType_Multiplay_3 = 8,               // Multi-play-3
  DH_RType_Realplay_4 = 9,                // Real-time monitor-extra stream 4
}

// ============================================================================
// BIBLIOTECA NETSDK
// ============================================================================

class IntelbrasNetSDK {
  private lib: any;
  private isInitialized: boolean = false;
  private disconnectCallback: any = null;

  constructor() {
    const platform = os.platform();
    let libPath: string;

    if (platform === 'win32') {
      // Windows
      libPath = path.join(__dirname, '../../../NetSDK 3.050/Linux/bin/dhnetsdk.dll');
    } else if (platform === 'linux') {
      // Linux
      libPath = path.join(__dirname, '../../../NetSDK 3.050/Linux/bin/libdhnetsdk.so');
    } else {
      throw new Error(`Plataforma não suportada: ${platform}`);
    }

    // Carregar biblioteca NetSDK
    this.lib = ffi.Library(libPath, {
      // Inicialização
      'CLIENT_Init': [BOOL, [fDisConnect, LDWORD]],
      'CLIENT_Cleanup': [ref.types.void, []],

      // Login/Logout
      'CLIENT_LoginEx2': [LLONG, [
        CharPtr,                    // IP
        WORD,                       // Port
        CharPtr,                    // Username
        CharPtr,                    // Password
        ref.types.int,              // EM_LOGIN_SPAC_CAP_TYPE
        VoidPtr,                    // pCapParam
        VoidPtr,                    // lpDeviceInfo
        IntPtr                      // error
      ]],
      'CLIENT_Logout': [BOOL, [LLONG]],

      // Real-time Play
      'CLIENT_RealPlayEx': [LLONG, [
        LLONG,                      // lLoginID
        ref.types.int,              // nChannelID
        VoidPtr,                    // hWnd (NULL para headless)
        ref.types.int               // DH_RealPlayType
      ]],
      'CLIENT_StopRealPlay': [BOOL, [LLONG]],

      // PTZ Control
      'CLIENT_PTZControl': [BOOL, [
        LLONG,                      // lLoginID
        ref.types.int,              // nChannelID
        DWORD,                      // dwPTZCommand
        DWORD,                      // dwStep
        BOOL                        // dwStop
      ]],

      // Snapshot
      'CLIENT_CapturePicture': [BOOL, [
        LLONG,                      // hPlayHandle
        CharPtr                     // pchPicFileName
      ]],

      // Device Info
      'CLIENT_QueryDevState': [BOOL, [
        LLONG,                      // lLoginID
        ref.types.int,              // nType
        CharPtr,                    // pBuf
        ref.types.int,              // nBufLen
        IntPtr,                     // pRetLen
        ref.types.int               // waittime
      ]],

      // Get Last Error
      'CLIENT_GetLastError': [DWORD, []],
    });
  }

  /**
   * Inicializa o SDK
   */
  init(): boolean {
    if (this.isInitialized) {
      console.log('[NetSDK] SDK já inicializado');
      return true;
    }

    try {
      // Criar callback de desconexão
      this.disconnectCallback = ffi.Callback(ref.types.void,
        [LLONG, CharPtr, LONG, LDWORD],
        (loginId: number, ip: string, port: number, user: number) => {
          console.log(`[NetSDK] Desconectado: ${ip}:${port}`);
        }
      );

      const result = this.lib.CLIENT_Init(this.disconnectCallback, 0);

      if (result) {
        this.isInitialized = true;
        console.log('[NetSDK] SDK inicializado com sucesso');
        return true;
      } else {
        console.error('[NetSDK] Falha ao inicializar SDK');
        return false;
      }
    } catch (error) {
      console.error('[NetSDK] Erro ao inicializar:', error);
      return false;
    }
  }

  /**
   * Faz login no DVR
   */
  login(ip: string, port: number, username: string, password: string): number {
    if (!this.isInitialized) {
      console.error('[NetSDK] SDK não inicializado');
      return 0;
    }

    try {
      const errorCode = ref.alloc(ref.types.int);
      const deviceInfo = Buffer.alloc(1024); // Buffer para NET_DEVICEINFO_Ex

      const loginHandle = this.lib.CLIENT_LoginEx2(
        ip,
        port,
        username,
        password,
        EM_LOGIN_SPAC_CAP_TYPE.EM_LOGIN_SPEC_CAP_TCP,
        null,
        deviceInfo,
        errorCode
      );

      if (loginHandle === 0) {
        const error = errorCode.deref();
        console.error(`[NetSDK] Falha no login. Código de erro: ${error}`);
        console.error(`[NetSDK] ${this.getLoginErrorMessage(error)}`);
        return 0;
      }

      console.log(`[NetSDK] Login realizado com sucesso: ${ip}:${port}`);
      return Number(loginHandle);
    } catch (error) {
      console.error('[NetSDK] Erro ao fazer login:', error);
      return 0;
    }
  }

  /**
   * Faz logout do DVR
   */
  logout(loginHandle: number): boolean {
    try {
      const result = this.lib.CLIENT_Logout(loginHandle);

      if (result) {
        console.log('[NetSDK] Logout realizado com sucesso');
        return true;
      } else {
        console.error('[NetSDK] Falha ao fazer logout');
        return false;
      }
    } catch (error) {
      console.error('[NetSDK] Erro ao fazer logout:', error);
      return false;
    }
  }

  /**
   * Inicia visualização em tempo real
   */
  startRealPlay(loginHandle: number, channel: number = 0): number {
    try {
      const realHandle = this.lib.CLIENT_RealPlayEx(
        loginHandle,
        channel,
        null, // NULL para modo headless (sem janela)
        DH_RealPlayType.DH_RType_Realplay_1 // Stream extra 1
      );

      if (realHandle === 0) {
        const error = this.lib.CLIENT_GetLastError();
        console.error(`[NetSDK] Falha ao iniciar real play. Erro: ${error}`);
        return 0;
      }

      console.log(`[NetSDK] Real play iniciado no canal ${channel}`);
      return Number(realHandle);
    } catch (error) {
      console.error('[NetSDK] Erro ao iniciar real play:', error);
      return 0;
    }
  }

  /**
   * Para visualização em tempo real
   */
  stopRealPlay(realHandle: number): boolean {
    try {
      const result = this.lib.CLIENT_StopRealPlay(realHandle);

      if (result) {
        console.log('[NetSDK] Real play parado com sucesso');
        return true;
      } else {
        console.error('[NetSDK] Falha ao parar real play');
        return false;
      }
    } catch (error) {
      console.error('[NetSDK] Erro ao parar real play:', error);
      return false;
    }
  }

  /**
   * Controla PTZ da câmera
   */
  ptzControl(loginHandle: number, channel: number, command: number, speed: number = 4): boolean {
    try {
      // Start command
      let result = this.lib.CLIENT_PTZControl(loginHandle, channel, command, speed, false);

      if (!result) {
        const error = this.lib.CLIENT_GetLastError();
        console.error(`[NetSDK] Falha no controle PTZ. Erro: ${error}`);
        return false;
      }

      // Stop command após um tempo (você pode ajustar isso)
      setTimeout(() => {
        this.lib.CLIENT_PTZControl(loginHandle, channel, command, speed, true);
      }, 500);

      return true;
    } catch (error) {
      console.error('[NetSDK] Erro ao controlar PTZ:', error);
      return false;
    }
  }

  /**
   * Captura snapshot
   */
  captureSnapshot(realHandle: number, filePath: string): boolean {
    try {
      const result = this.lib.CLIENT_CapturePicture(realHandle, filePath);

      if (result) {
        console.log(`[NetSDK] Snapshot capturado: ${filePath}`);
        return true;
      } else {
        const error = this.lib.CLIENT_GetLastError();
        console.error(`[NetSDK] Falha ao capturar snapshot. Erro: ${error}`);
        return false;
      }
    } catch (error) {
      console.error('[NetSDK] Erro ao capturar snapshot:', error);
      return false;
    }
  }

  /**
   * Limpa recursos do SDK
   */
  cleanup(): void {
    if (this.isInitialized) {
      this.lib.CLIENT_Cleanup();
      this.isInitialized = false;
      console.log('[NetSDK] SDK finalizado');
    }
  }

  /**
   * Retorna mensagem de erro de login
   */
  private getLoginErrorMessage(errorCode: number): string {
    const errorMessages: { [key: number]: string } = {
      0: 'Login bem-sucedido',
      1: 'Usuário ou senha incorretos',
      2: 'Usuário não existe',
      3: 'Timeout de login',
      4: 'Login duplicado',
      5: 'Conta bloqueada',
      6: 'Usuário na blacklist',
      7: 'Dispositivo ocupado',
      8: 'Falha na subconexão',
      9: 'Falha na conexão principal',
      10: 'Máximo de conexões atingido',
      11: 'Apenas protocolo 3 suportado',
      12: 'Erro na chave UKey',
      13: 'Não autorizado',
      18: 'Conta do dispositivo não inicializada'
    };

    return errorMessages[errorCode] || `Erro desconhecido (${errorCode})`;
  }
}

// ============================================================================
// COMANDOS PTZ
// ============================================================================

export enum PTZCommand {
  // Direções
  PTZ_UP_CONTROL = 0,
  PTZ_DOWN_CONTROL = 1,
  PTZ_LEFT_CONTROL = 2,
  PTZ_RIGHT_CONTROL = 3,
  PTZ_ZOOM_ADD_CONTROL = 4,     // Zoom in
  PTZ_ZOOM_DEC_CONTROL = 5,     // Zoom out
  PTZ_FOCUS_ADD_CONTROL = 6,    // Focus far
  PTZ_FOCUS_DEC_CONTROL = 7,    // Focus near
  PTZ_IRIS_ENLARGE_CONTROL = 8, // Iris open
  PTZ_IRIS_REDUCE_CONTROL = 9,  // Iris close

  // Movimentos compostos
  PTZ_UP_LEFT_CONTROL = 10,
  PTZ_UP_RIGHT_CONTROL = 11,
  PTZ_DOWN_LEFT_CONTROL = 12,
  PTZ_DOWN_RIGHT_CONTROL = 13,

  // Presets
  PTZ_POINT_SET_CONTROL = 100,  // Set preset
  PTZ_POINT_MOVE_CONTROL = 101, // Go to preset
  PTZ_POINT_DEL_CONTROL = 102,  // Delete preset
}

// ============================================================================
// EXPORTAÇÃO
// ============================================================================

export default IntelbrasNetSDK;
export { EM_LOGIN_SPAC_CAP_TYPE, DH_RealPlayType };
