/**
 * Controlador para operações do DVR via NetSDK
 */

import { Request, Response } from 'express';
import DVRNetSDKService from '../services/dvr-netsdk.service';
import { PTZCommand } from '../lib/intelbras-netsdk';

export class DVRController {
  /**
   * Testa conexão com o DVR
   */
  static async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const result = await DVRNetSDKService.testConnection();

      res.json({
        success: result.success,
        message: result.message
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Erro ao testar conexão: ${error.message}`
      });
    }
  }

  /**
   * Obtém status da conexão
   */
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = DVRNetSDKService.getConnectionStatus();

      res.json({
        success: true,
        data: {
          connected: status.connected,
          loginHandle: status.loginHandle,
          config: status.config ? {
            ip: status.config.dvrIp,
            port: status.config.dvrPort,
            username: status.config.username,
            channelCount: status.config.channelCount
          } : null
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Erro ao obter status: ${error.message}`
      });
    }
  }

  /**
   * Captura snapshot de um canal
   */
  static async captureSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const { channel = 0 } = req.body;

      const snapshotPath = await DVRNetSDKService.captureSnapshot(channel);

      if (snapshotPath) {
        res.json({
          success: true,
          message: 'Snapshot capturado com sucesso',
          data: {
            path: snapshotPath,
            channel
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Falha ao capturar snapshot'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Erro ao capturar snapshot: ${error.message}`
      });
    }
  }

  /**
   * Controla PTZ da câmera
   */
  static async controlPTZ(req: Request, res: Response): Promise<void> {
    try {
      const { channel, command, speed = 4 } = req.body;

      if (channel === undefined || command === undefined) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros channel e command são obrigatórios'
        });
        return;
      }

      const success = await DVRNetSDKService.controlPTZ(channel, command, speed);

      if (success) {
        res.json({
          success: true,
          message: 'Comando PTZ enviado com sucesso',
          data: { channel, command, speed }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Falha ao enviar comando PTZ'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Erro ao controlar PTZ: ${error.message}`
      });
    }
  }

  /**
   * Move PTZ para cima
   */
  static async movePTZUp(req: Request, res: Response): Promise<void> {
    try {
      const { channel, speed = 4 } = req.body;

      const success = await DVRNetSDKService.movePTZUp(channel, speed);

      res.json({
        success,
        message: success ? 'PTZ movido para cima' : 'Falha ao mover PTZ'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Erro: ${error.message}`
      });
    }
  }

  /**
   * Move PTZ para baixo
   */
  static async movePTZDown(req: Request, res: Response): Promise<void> {
    try {
      const { channel, speed = 4 } = req.body;

      const success = await DVRNetSDKService.movePTZDown(channel, speed);

      res.json({
        success,
        message: success ? 'PTZ movido para baixo' : 'Falha ao mover PTZ'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Erro: ${error.message}`
      });
    }
  }

  /**
   * Move PTZ para esquerda
   */
  static async movePTZLeft(req: Request, res: Response): Promise<void> {
    try {
      const { channel, speed = 4 } = req.body;

      const success = await DVRNetSDKService.movePTZLeft(channel, speed);

      res.json({
        success,
        message: success ? 'PTZ movido para esquerda' : 'Falha ao mover PTZ'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Erro: ${error.message}`
      });
    }
  }

  /**
   * Move PTZ para direita
   */
  static async movePTZRight(req: Request, res: Response): Promise<void> {
    try {
      const { channel, speed = 4 } = req.body;

      const success = await DVRNetSDKService.movePTZRight(channel, speed);

      res.json({
        success,
        message: success ? 'PTZ movido para direita' : 'Falha ao mover PTZ'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Erro: ${error.message}`
      });
    }
  }

  /**
   * Zoom in da câmera
   */
  static async ptzZoomIn(req: Request, res: Response): Promise<void> {
    try {
      const { channel, speed = 4 } = req.body;

      const success = await DVRNetSDKService.ptzZoomIn(channel, speed);

      res.json({
        success,
        message: success ? 'Zoom in aplicado' : 'Falha ao aplicar zoom'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Erro: ${error.message}`
      });
    }
  }

  /**
   * Zoom out da câmera
   */
  static async ptzZoomOut(req: Request, res: Response): Promise<void> {
    try {
      const { channel, speed = 4 } = req.body;

      const success = await DVRNetSDKService.ptzZoomOut(channel, speed);

      res.json({
        success,
        message: success ? 'Zoom out aplicado' : 'Falha ao aplicar zoom'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Erro: ${error.message}`
      });
    }
  }

  /**
   * Define preset PTZ
   */
  static async setPTZPreset(req: Request, res: Response): Promise<void> {
    try {
      const { channel, presetNumber } = req.body;

      if (channel === undefined || presetNumber === undefined) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros channel e presetNumber são obrigatórios'
        });
        return;
      }

      const success = await DVRNetSDKService.setPTZPreset(channel, presetNumber);

      res.json({
        success,
        message: success
          ? `Preset ${presetNumber} definido no canal ${channel}`
          : 'Falha ao definir preset',
        data: { channel, presetNumber }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Erro: ${error.message}`
      });
    }
  }

  /**
   * Vai para preset PTZ
   */
  static async gotoPTZPreset(req: Request, res: Response): Promise<void> {
    try {
      const { channel, presetNumber } = req.body;

      if (channel === undefined || presetNumber === undefined) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros channel e presetNumber são obrigatórios'
        });
        return;
      }

      const success = await DVRNetSDKService.gotoPTZPreset(channel, presetNumber);

      res.json({
        success,
        message: success
          ? `Movendo para preset ${presetNumber} no canal ${channel}`
          : 'Falha ao ir para preset',
        data: { channel, presetNumber }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Erro: ${error.message}`
      });
    }
  }
}

export default DVRController;
