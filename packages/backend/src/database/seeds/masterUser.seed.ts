import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/User';

/**
 * Seed do usuário master padrão
 * Cria automaticamente o usuário "Beto" na primeira instalação
 */
export async function seedMasterUser(dataSource: DataSource): Promise<void> {
  try {
    console.log('🌱 Verificando se usuário master existe...');

    const userRepository = dataSource.getRepository(User);

    // Verificar se já existe algum usuário master
    const existingMaster = await userRepository.findOne({
      where: { isMaster: true }
    });

    if (existingMaster) {
      console.log('✅ Usuário master já existe. Pulando seed...');
      return;
    }

    console.log('🔧 Criando usuário master padrão...');

    // Hash da senha manualmente (BeforeInsert não funciona em save direto)
    const hashedPassword = await bcrypt.hash('Beto3107@', 10);

    // Criar usuário master
    const masterUser = userRepository.create({
      name: 'Beto',
      username: 'Beto',
      email: 'admin@prevencao.com.br',
      password: hashedPassword,
      role: UserRole.MASTER,
      isMaster: true
      // companyId será null por padrão (associado quando a empresa for criada)
    });

    await userRepository.save(masterUser);

    console.log('✅ Usuário master criado com sucesso!');
    console.log('📝 Credenciais:');
    console.log('   Usuário: Beto');
    console.log('   Senha: Beto3107@');

  } catch (error) {
    console.error('❌ Erro ao criar usuário master:', error);
    // Não lançar erro para não quebrar a aplicação
  }
}
