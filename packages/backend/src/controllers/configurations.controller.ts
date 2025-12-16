import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Configuration } from '../entities/Configuration';

const configRepository = AppDataSource.getRepository(Configuration);

export class ConfigurationsController {
  /**
   * GET /api/configurations
   * Buscar todas as configurações
   */
  async index(req: Request, res: Response) {
    try {
      const configurations = await configRepository.find();

      // Converter para objeto chave-valor para facilitar uso no frontend
      const configMap: Record<string, string | null> = {};
      configurations.forEach(config => {
        configMap[config.key] = config.value;
      });

      return res.json(configMap);
    } catch (error) {
      console.error('Error fetching configurations:', error);
      return res.status(500).json({ error: 'Failed to fetch configurations' });
    }
  }

  /**
   * GET /api/configurations/:key
   * Buscar configuração específica por chave
   */
  async show(req: Request, res: Response) {
    try {
      const { key } = req.params;

      const configuration = await configRepository.findOne({
        where: { key }
      });

      if (!configuration) {
        return res.status(404).json({ error: 'Configuration not found' });
      }

      return res.json(configuration);
    } catch (error) {
      console.error('Error fetching configuration:', error);
      return res.status(500).json({ error: 'Failed to fetch configuration' });
    }
  }

  /**
   * PUT /api/configurations/:key
   * Atualizar configuração específica
   */
  async update(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const { value } = req.body;

      if (!value) {
        return res.status(400).json({ error: 'Value is required' });
      }

      let configuration = await configRepository.findOne({
        where: { key }
      });

      if (!configuration) {
        // Criar se não existir
        configuration = configRepository.create({ key, value });
      } else {
        configuration.value = value;
      }

      await configRepository.save(configuration);

      return res.json(configuration);
    } catch (error) {
      console.error('Error updating configuration:', error);
      return res.status(500).json({ error: 'Failed to update configuration' });
    }
  }

  /**
   * GET /api/configurations/email
   * Buscar configurações de email
   */
  async getEmailConfig(req: Request, res: Response) {
    try {
      const emailUser = process.env.EMAIL_USER || '';
      const emailPass = process.env.EMAIL_PASS || '';

      return res.json({
        email_user: emailUser,
        email_pass: emailPass
      });
    } catch (error) {
      console.error('Error fetching email configuration:', error);
      return res.status(500).json({ error: 'Failed to fetch email configuration' });
    }
  }

  /**
   * PUT /api/configurations/email
   * Atualizar configurações de email no .env
   */
  async updateEmailConfig(req: Request, res: Response) {
    try {
      const { email_user, email_pass } = req.body;

      if (!email_user || !email_pass) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const fs = require('fs');
      const path = require('path');

      // Caminho do arquivo .env
      const envPath = path.resolve(__dirname, '../../.env');

      // Ler o arquivo .env atual
      let envContent = '';
      try {
        envContent = fs.readFileSync(envPath, 'utf8');
      } catch (error) {
        return res.status(500).json({ error: 'Arquivo .env não encontrado' });
      }

      // Atualizar ou adicionar EMAIL_USER
      if (envContent.includes('EMAIL_USER=')) {
        envContent = envContent.replace(/EMAIL_USER=.*/g, `EMAIL_USER=${email_user}`);
      } else {
        envContent += `\nEMAIL_USER=${email_user}`;
      }

      // Atualizar ou adicionar EMAIL_PASS
      if (envContent.includes('EMAIL_PASS=')) {
        envContent = envContent.replace(/EMAIL_PASS=.*/g, `EMAIL_PASS=${email_pass}`);
      } else {
        envContent += `\nEMAIL_PASS=${email_pass}`;
      }

      // Escrever de volta no arquivo .env
      fs.writeFileSync(envPath, envContent, 'utf8');

      return res.json({
        message: 'Configurações de email atualizadas. Reinicie o backend para aplicar.',
        email_user,
        email_pass: '***' // Não retornar a senha real
      });
    } catch (error) {
      console.error('Error updating email configuration:', error);
      return res.status(500).json({ error: 'Failed to update email configuration' });
    }
  }
}
