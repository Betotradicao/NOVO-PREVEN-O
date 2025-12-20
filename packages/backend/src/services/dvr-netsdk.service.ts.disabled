/**
 * Serviço DVR usando Intelbras NetSDK
 * Substitui a conexão TCP simples por uma integração completa via SDK
 */

import IntelbrasNetSDK, { PTZCommand } from '../lib/intelbras-netsdk';
import { ConfigurationService } from './configuration.service';
import { Sale } from './sales.service';
import * as fs from 'fs';
import * as path from 'path';

export interface DVRNetSDKConfig {
  enabled: boolean;
  dvrIp: string;
  dvrPort: number;
  username: string;
  password: string;
  channelCount: number;
  snapshotPath: string;
}

export class DVRNetSDKService {
  private static sdk: IntelbrasNetSDK | null = null;
  private static loginHandle: number = 0;
  private static config: DVRNetSDKConfig | null = null;
  private static reconnectTimer: NodeJS.Timeout | null = null;

  /**
   * Inicializa o serviço NetSDK
   */
  static async initialize(): Promise<void> {
    try {
      // Carregar configurações
      this.config = await this.loadConfig();

      if (!this.config.enabled) {
        console.log('[DVR-NetSDK] Serviço desabilitado nas configurações');
        return;
      }

      // Criar diretório de snapshots se não existir
      if (!fs.existsSync(this.config.snapshotPath)) {
        fs.mkdirSync(this.config.snapshotPath, { recursive: true });
      }

      // Inicializar SDK
      this.sdk = new IntelbrasNetSDK();
      const initResult = this.sdk.init();

      if (!initResult) {
        console.error('[DVR-NetSDK] Falha ao inicializar SDK');
        return;
      }

      // Fazer login
      await this.connect();
    } catch (error) {
      console.error('[DVR-NetSDK] Erro ao inicializar:', error);
    }
  }

  /**
   * Carrega configurações do banco de dados
   */
  private static async loadConfig(): Promise<DVRNetSDKConfig> {
    const enabled = await ConfigurationService.get('dvr_netsdk_enabled', 'false');
    const dvrIp = await ConfigurationService.get('dvr_ip', '192.168.1.108');
    const dvrPort = await ConfigurationService.get('dvr_port', '37777');
    const username = await ConfigurationService.get('dvr_username', 'admin');
    const password = await ConfigurationService.get('dvr_password', '');
    const channelCount = await ConfigurationService.get('dvr_channel_count', '16');
    const snapshotPath = await ConfigurationService.get('dvr_snapshot_path', './uploads/dvr-snapshots');

    return {
      enabled: enabled === 'true',
      dvrIp: String(dvrIp),
      dvrPort: parseInt(String(dvrPort)),
      username: String(username),
      password: String(password),
      channelCount: parseInt(String(channelCount)),
      snapshotPath: String(snapshotPath)
    };
  }

  /**
   * Conecta ao DVR via NetSDK
   */
  private static async connect(): Promise<void> {
    if (!this.sdk || !this.config) {
      throw new Error('SDK não inicializado');
    }

    console.log(`[DVR-NetSDK] Conectando ao DVR ${this.config.dvrIp}:${this.config.dvrPort}...`);

    this.loginHandle = this.sdk.login(
      this.config.dvrIp,
      this.config.dvrPort,
      this.config.username,
      this.config.password
    );

    if (this.loginHandle === 0) {
      console.error('[DVR-NetSDK] Falha ao conectar ao DVR');
      this.scheduleReconnect();
      throw new Error('Falha ao conectar ao DVR');
    }

    console.log(`[DVR-NetSDK] Conectado ao DVR com sucesso. Handle: ${this.loginHandle}`);
  }

  /**
   * Agenda reconexão automática
   */
  private static scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(async () => {
      console.log('[DVR-NetSDK] Tentando reconectar...');
      try {
        await this.connect();
      } catch (error) {
        console.error('[DVR-NetSDK] Falha ao reconectar:', error);
      }
    }, 30000); // Tenta reconectar após 30 segundos
  }

  /**
   * Captura snapshot de um canal
   */
  static async captureSnapshot(channel: number = 0): Promise<string | null> {
    if (!this.sdk || this.loginHandle === 0 || !this.config) {
      console.error('[DVR-NetSDK] DVR não conectado');
      return null;
    }

    try {
      // Iniciar stream do canal
      const realHandle = this.sdk.startRealPlay(this.loginHandle, channel);

      if (realHandle === 0) {
        console.error(`[DVR-NetSDK] Falha ao iniciar stream do canal ${channel}`);
        return null;
      }

      // Aguardar um pouco para o stream estabilizar
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Gerar nome do arquivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `snapshot_ch${channel}_${timestamp}.jpg`;
      const filePath = path.join(this.config.snapshotPath, filename);

      // Capturar snapshot
      const success = this.sdk.captureSnapshot(realHandle, filePath);

      // Parar stream
      this.sdk.stopRealPlay(realHandle);

      if (success && fs.existsSync(filePath)) {
        console.log(`[DVR-NetSDK] Snapshot capturado: ${filePath}`);
        return filePath;
      } else {
        console.error('[DVR-NetSDK] Falha ao capturar snapshot');
        return null;
      }
    } catch (error) {
      console.error('[DVR-NetSDK] Erro ao capturar snapshot:', error);
      return null;
    }
  }

  /**
   * Controla PTZ da câmera
   */
  static async controlPTZ(
    channel: number,
    command: PTZCommand,
    speed: number = 4
  ): Promise<boolean> {
    if (!this.sdk || this.loginHandle === 0) {
      console.error('[DVR-NetSDK] DVR não conectado');
      return false;
    }

    try {
      const success = this.sdk.ptzControl(this.loginHandle, channel, command, speed);

      if (success) {
        console.log(`[DVR-NetSDK] Comando PTZ enviado: ${PTZCommand[command]} (canal ${channel})`);
      }

      return success;
    } catch (error) {
      console.error('[DVR-NetSDK] Erro ao controlar PTZ:', error);
      return false;
    }
  }

  /**
   * Move câmera PTZ para cima
   */
  static async movePTZUp(channel: number, speed: number = 4): Promise<boolean> {
    return this.controlPTZ(channel, PTZCommand.PTZ_UP_CONTROL, speed);
  }

  /**
   * Move câmera PTZ para baixo
   */
  static async movePTZDown(channel: number, speed: number = 4): Promise<boolean> {
    return this.controlPTZ(channel, PTZCommand.PTZ_DOWN_CONTROL, speed);
  }

  /**
   * Move câmera PTZ para esquerda
   */
  static async movePTZLeft(channel: number, speed: number = 4): Promise<boolean> {
    return this.controlPTZ(channel, PTZCommand.PTZ_LEFT_CONTROL, speed);
  }

  /**
   * Move câmera PTZ para direita
   */
  static async movePTZRight(channel: number, speed: number = 4): Promise<boolean> {
    return this.controlPTZ(channel, PTZCommand.PTZ_RIGHT_CONTROL, speed);
  }

  /**
   * Zoom in da câmera
   */
  static async ptzZoomIn(channel: number, speed: number = 4): Promise<boolean> {
    return this.controlPTZ(channel, PTZCommand.PTZ_ZOOM_ADD_CONTROL, speed);
  }

  /**
   * Zoom out da câmera
   */
  static async ptzZoomOut(channel: number, speed: number = 4): Promise<boolean> {
    return this.controlPTZ(channel, PTZCommand.PTZ_ZOOM_DEC_CONTROL, speed);
  }

  /**
   * Define preset PTZ
   */
  static async setPTZPreset(channel: number, presetNumber: number): Promise<boolean> {
    if (!this.sdk || this.loginHandle === 0) {
      console.error('[DVR-NetSDK] DVR não conectado');
      return false;
    }

    try {
      const success = this.sdk.ptzControl(
        this.loginHandle,
        channel,
        PTZCommand.PTZ_POINT_SET_CONTROL,
        presetNumber
      );

      if (success) {
        console.log(`[DVR-NetSDK] Preset ${presetNumber} definido no canal ${channel}`);
      }

      return success;
    } catch (error) {
      console.error('[DVR-NetSDK] Erro ao definir preset:', error);
      return false;
    }
  }

  /**
   * Vai para preset PTZ
   */
  static async gotoPTZPreset(channel: number, presetNumber: number): Promise<boolean> {
    if (!this.sdk || this.loginHandle === 0) {
      console.error('[DVR-NetSDK] DVR não conectado');
      return false;
    }

    try {
      const success = this.sdk.ptzControl(
        this.loginHandle,
        channel,
        PTZCommand.PTZ_POINT_MOVE_CONTROL,
        presetNumber
      );

      if (success) {
        console.log(`[DVR-NetSDK] Movendo para preset ${presetNumber} no canal ${channel}`);
      }

      return success;
    } catch (error) {
      console.error('[DVR-NetSDK] Erro ao ir para preset:', error);
      return false;
    }
  }

  /**
   * Testa a conexão com o DVR
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      this.config = await this.loadConfig();

      if (!this.config.enabled) {
        return {
          success: false,
          message: 'DVR NetSDK está desabilitado nas configurações'
        };
      }

      // Tentar conectar
      if (!this.sdk) {
        this.sdk = new IntelbrasNetSDK();
        this.sdk.init();
      }

      await this.connect();

      if (this.loginHandle > 0) {
        return {
          success: true,
          message: `Conexão NetSDK estabelecida com ${this.config.dvrIp}:${this.config.dvrPort}`
        };
      } else {
        return {
          success: false,
          message: 'Falha ao autenticar no DVR'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erro: ${error.message}`
      };
    }
  }

  /**
   * Obtém status da conexão
   */
  static getConnectionStatus(): {
    connected: boolean;
    loginHandle: number;
    config: DVRNetSDKConfig | null;
  } {
    return {
      connected: this.loginHandle > 0,
      loginHandle: this.loginHandle,
      config: this.config
    };
  }

  /**
   * Desconecta do DVR e limpa recursos
   */
  static disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.sdk && this.loginHandle > 0) {
      this.sdk.logout(this.loginHandle);
      this.loginHandle = 0;
    }

    if (this.sdk) {
      this.sdk.cleanup();
      this.sdk = null;
    }

    console.log('[DVR-NetSDK] Desconectado e recursos liberados');
  }

  /**
   * Processa uma venda (mantido para compatibilidade com o sistema atual)
   * Nota: O NetSDK não envia texto diretamente. Esta função poderia ser
   * adaptada para gravar um log ou capturar snapshot da venda.
   */
  static async processSale(sale: Sale): Promise<boolean> {
    try {
      this.config = await this.loadConfig();

      if (!this.config.enabled) {
        console.log('[DVR-NetSDK] Serviço desabilitado, ignorando venda');
        return false;
      }

      console.log(`[DVR-NetSDK] Processando venda ${sale.numCupomFiscal}`);

      // Aqui você poderia:
      // 1. Capturar snapshot do canal principal no momento da venda
      // 2. Logar a venda com timestamp
      // 3. Enviar comando para outro sistema

      // Exemplo: capturar snapshot
      const snapshotPath = await this.captureSnapshot(0);

      if (snapshotPath) {
        console.log(`[DVR-NetSDK] Snapshot da venda capturado: ${snapshotPath}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[DVR-NetSDK] Erro ao processar venda:', error);
      return false;
    }
  }
}

export default DVRNetSDKService;
