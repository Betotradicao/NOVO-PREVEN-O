import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

/**
 * Componente que verifica se o sistema precisa de setup inicial
 * Redireciona para /first-setup se necessário
 */
export default function SetupCheck({ children }) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await api.get('/setup/status');
      const { needsSetup } = response.data;

      setNeedsSetup(needsSetup);

      // Se precisa de setup, redireciona para a página de primeiro acesso
      if (needsSetup) {
        console.log('🔧 Sistema precisa de configuração inicial');
        navigate('/first-setup', { replace: true });
      }
    } catch (error) {
      console.error('Erro ao verificar status do setup:', error);
      // Em caso de erro, assume que não precisa de setup e continua
    } finally {
      setIsChecking(false);
    }
  };

  // Enquanto estiver verificando, mostra um loading
  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #ea580c',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Verificando configuração do sistema...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Se precisa de setup, não renderiza os children (o navigate já foi chamado)
  if (needsSetup) {
    return null;
  }

  // Se não precisa de setup, renderiza normalmente
  return children;
}
