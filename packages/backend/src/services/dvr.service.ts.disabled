import * as net from 'net';
import { ConfigurationService } from './configuration.service';
import { Sale } from './sales.service';

export interface DVRConfig {
  enabled: boolean;
  dvrIp: string;
  dvrPort: number;
  connectionTimeout: number;
}

export class DVRService {
  private static client: net.Socket | null = null;
  private static reconnectTimer: NodeJS.Timeout | null = null;
  private static config: DVRConfig | null = null;

  /**
   * Inicializa a conexão com o DVR
   */
  static async initialize(): Promise<void> {
    try {
      // Carregar configurações do banco
      this.config = await this.loadConfig();

      if (!this.config.enabled) {
        console.log('[DVR] Serviço desabilitado nas configurações');
        return;
      }

      console.log(`[DVR] Inicializando conexão com ${this.config.dvrIp}:${this.config.dvrPort}`);
      await this.connect();
    } catch (error) {
      console.error('[DVR] Erro ao inicializar:', error);
    }
  }

  /**
   * Carrega configurações do banco de dados
   */
  private static async loadConfig(): Promise<DVRConfig> {
    const enabled = await ConfigurationService.get('dvr_enabled', 'false');
    const dvrIp = await ConfigurationService.get('dvr_ip', '10.6.1.123');
    const dvrPort = await ConfigurationService.get('dvr_port', '38800');
    const timeout = await ConfigurationService.get('dvr_timeout', '5000');

    return {
      enabled: enabled === 'true',
      dvrIp: String(dvrIp),
      dvrPort: parseInt(String(dvrPort)),
      connectionTimeout: parseInt(String(timeout))
    };
  }

  /**
   * Conecta ao DVR via TCP
   */
  private static async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.config) {
        reject(new Error('DVR config not loaded'));
        return;
      }

      this.client = new net.Socket();

      this.client.setTimeout(this.config.connectionTimeout);

      this.client.on('connect', () => {
        console.log(`[DVR] Conectado ao DVR ${this.config!.dvrIp}:${this.config!.dvrPort}`);
        resolve();
      });

      this.client.on('error', (error) => {
        console.error('[DVR] Erro de conexão:', error.message);
        this.scheduleReconnect();
      });

      this.client.on('close', () => {
        console.log('[DVR] Conexão fechada');
        this.scheduleReconnect();
      });

      this.client.on('timeout', () => {
        console.error('[DVR] Timeout de conexão');
        this.client?.destroy();
        this.scheduleReconnect();
      });

      // Conectar ao DVR
      this.client.connect(this.config.dvrPort, this.config.dvrIp);
    });
  }

  /**
   * Agenda reconexão automática
   */
  private static scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Tentar reconectar após 10 segundos
    this.reconnectTimer = setTimeout(async () => {
      console.log('[DVR] Tentando reconectar...');
      try {
        await this.connect();
      } catch (error) {
        console.error('[DVR] Falha ao reconectar:', error);
      }
    }, 10000);
  }

  /**
   * Envia texto formatado para o DVR
   */
  private static async sendToDVR(text: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.client || this.client.destroyed) {
        console.warn('[DVR] Cliente não conectado, tentando reconectar...');
        this.connect().catch(console.error);
        resolve(false);
        return;
      }

      try {
        this.client.write(text, 'utf8', (error) => {
          if (error) {
            console.error('[DVR] Erro ao enviar dados:', error);
            resolve(false);
          } else {
            console.log('[DVR] Dados enviados com sucesso');
            resolve(true);
          }
        });
      } catch (error) {
        console.error('[DVR] Exceção ao enviar dados:', error);
        resolve(false);
      }
    });
  }

  /**
   * Formata uma venda no padrão do DVR Intelbras
   * Usa "|" como separador de linha conforme documentação
   */
  private static formatSaleForDVR(sale: Sale): string {
    const lines: string[] = [];

    // Cabeçalho do cupom
    lines.push(`===== CUPOM FISCAL ${sale.numCupomFiscal} =====`);
    lines.push(`Data: ${this.formatDate(sale.dtaSaida)} ${this.formatTime(sale.dataHoraVenda)}`);
    lines.push(`Caixa: ${sale.codCaixa}`);
    lines.push('');

    // Item
    lines.push(`Item: ${sale.desProduto}`);
    lines.push(`Qtd: ${sale.qtdTotalProduto} x R$ ${sale.valVenda.toFixed(2)}`);

    // Desconto (se houver)
    if (sale.descontoAplicado && sale.descontoAplicado > 0) {
      lines.push(`Desconto: R$ ${sale.descontoAplicado.toFixed(2)}`);
    }

    // Total
    lines.push(`Total: R$ ${sale.valTotalProduto.toFixed(2)}`);

    // Cancelamento (se houver)
    if (sale.tipoCancelamento) {
      lines.push('');
      lines.push('*** ITEM CANCELADO ***');
      lines.push(`Motivo: ${sale.motivoCancelamento || 'N/A'}`);
      lines.push(`Funcionario: ${sale.funcionarioCancelamento || 'N/A'}`);
    }

    lines.push('================================');

    // Juntar linhas com o separador "|" conforme protocolo do DVR
    return lines.join('|');
  }

  /**
   * Formata data no padrão YYYYMMDD para DD/MM/YYYY
   */
  private static formatDate(dateStr: string): string {
    if (!dateStr || dateStr.length !== 8) return dateStr;

    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    return `${day}/${month}/${year}`;
  }

  /**
   * Extrai hora do timestamp completo
   */
  private static formatTime(dateTimeStr?: string): string {
    if (!dateTimeStr) return '';

    // Se já tem hora no formato "YYYY-MM-DD HH:MM:SS"
    if (dateTimeStr.includes(' ')) {
      return dateTimeStr.split(' ')[1].substring(0, 5); // HH:MM
    }

    return '';
  }

  /**
   * Processa e envia uma venda para o DVR
   */
  static async processSale(sale: Sale): Promise<boolean> {
    try {
      // Recarregar config para verificar se está habilitado
      this.config = await this.loadConfig();

      if (!this.config.enabled) {
        console.log('[DVR] Serviço desabilitado, ignorando venda');
        return false;
      }

      const formattedText = this.formatSaleForDVR(sale);
      console.log('[DVR] Enviando venda:', formattedText.substring(0, 100) + '...');

      const success = await this.sendToDVR(formattedText);

      if (success) {
        console.log(`[DVR] Venda ${sale.numCupomFiscal} enviada com sucesso`);
      } else {
        console.error(`[DVR] Falha ao enviar venda ${sale.numCupomFiscal}`);
      }

      return success;
    } catch (error) {
      console.error('[DVR] Erro ao processar venda:', error);
      return false;
    }
  }

  /**
   * Processa múltiplas vendas
   */
  static async processSales(sales: Sale[]): Promise<number> {
    let successCount = 0;

    for (const sale of sales) {
      const success = await this.processSale(sale);
      if (success) successCount++;

      // Pequeno delay entre envios para não sobrecarregar o DVR
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`[DVR] ${successCount}/${sales.length} vendas enviadas com sucesso`);
    return successCount;
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
          message: 'DVR está desabilitado nas configurações'
        };
      }

      await this.connect();

      // Enviar mensagem de teste
      const testMessage = 'TESTE DE CONEXAO|Sistema Prevencao no Radar|' + new Date().toLocaleString();
      const success = await this.sendToDVR(testMessage);

      if (success) {
        return {
          success: true,
          message: `Conexão estabelecida com ${this.config.dvrIp}:${this.config.dvrPort}`
        };
      } else {
        return {
          success: false,
          message: 'Falha ao enviar mensagem de teste'
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
   * Desconecta do DVR
   */
  static disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.client) {
      this.client.destroy();
      this.client = null;
      console.log('[DVR] Desconectado');
    }
  }
}
