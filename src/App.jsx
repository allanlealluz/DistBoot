import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CadastroInsumo from './components/CadastroInsumo'; 
import Movimentacao from './components/Movimentacao';
import Historico from './components/Historico';

// Importante: Certifique-se de que a imagem está na pasta 'public' ou 'src/assets'
// Se estiver em 'public', use: src="/distboot.png"
// Se estiver em 'src/assets', faça o import: import logo from './assets/distboot.png'

export default function App() {
  const [user, setUser] = useState(null);
  const [telaAtiva, setTelaAtiva] = useState('dashboard');

  if (!user) return <Login onLogin={(dadosUsuario) => setUser(dadosUsuario)} />;

  const navegarPara = (tela) => setTelaAtiva(tela);

  return (
    <div className="d-flex vw-100 vh-100 overflow-hidden">
      
      {/* SIDEBAR MODERNA */}
      <aside className="d-flex flex-column p-4 text-white shadow-lg flex-shrink-0" 
             style={{ width: '280px', backgroundColor: '#0f172a', zIndex: 1000 }}>
        
        {/* LOGO COM TAMANHO DELIMITADO */}
        <div className="mb-5 text-center">
          <img 
            src="/distboot.png" 
            alt="DistBoot Logo" 
            style={{ width: '180px', height: 'auto', objectFit: 'contain' }} 
            className="mb-2"
          />
          <div className="badge bg-primary-subtle text-primary border border-primary-subtle px-3">
             Gestão Hospitalar
          </div>
        </div>
        
        <nav className="flex-grow-1">
          <ul className="nav nav-pills flex-column">
            <li className="nav-item mb-2">
              <button onClick={() => navegarPara('dashboard')} 
                      className={`nav-link w-100 text-start py-3 border-0 d-flex align-items-center ${telaAtiva === 'dashboard' ? 'active shadow' : 'text-white-50 bg-transparent'}`}>
                <i className="bi bi-grid-1x2-fill me-3"></i> Dashboard
              </button>
            </li>
            <li className="nav-item mb-2">
              <button onClick={() => navegarPara('cadastro')} 
                      className={`nav-link w-100 text-start py-3 border-0 d-flex align-items-center ${telaAtiva === 'cadastro' ? 'active shadow' : 'text-white-50 bg-transparent'}`}>
                <i className="bi bi-plus-circle-fill me-3"></i> Gestão de Insumos
              </button>
            </li>
            <li className="nav-item mb-2">
              <button onClick={() => navegarPara('movimentacao')} 
                      className={`nav-link w-100 text-start py-3 border-0 d-flex align-items-center ${telaAtiva === 'movimentacao' ? 'active shadow' : 'text-white-50 bg-transparent'}`}>
                <i className="bi bi-arrow-left-right me-3"></i> Movimentações
              </button>
            </li>
            <li className="nav-item mb-2">
              <button onClick={() => navegarPara('historico')} 
                      className={`nav-link w-100 text-start py-3 border-0 d-flex align-items-center ${telaAtiva === 'historico' ? 'active shadow' : 'text-white-50 bg-transparent'}`}>
                <i className="bi bi-clock-history me-3"></i> Auditoria
              </button>
            </li>
          </ul>
        </nav>
        
        {/* RODAPÉ DA SIDEBAR COM USUÁRIO */}
        <div className="mt-auto border-top border-secondary pt-3">
          <div className="d-flex align-items-center mb-3 px-2">
            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '32px', height: '32px'}}>
               {user.nome.charAt(0).toUpperCase()}
            </div>
            <div className="small text-truncate" style={{maxWidth: '180px'}} title={user.nome}>
               {user.nome}
            </div>
          </div>
          <button onClick={() => setUser(null)} className="btn btn-sm btn-outline-danger w-100 py-2 fw-bold">
             <i className="bi bi-box-arrow-left me-2"></i> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO */}
      <main className="flex-grow-1 h-100 overflow-auto bg-white p-5">
          {telaAtiva === 'dashboard' && <Dashboard />}
          {telaAtiva === 'cadastro' && <CadastroInsumo aoSucesso={() => navegarPara('dashboard')} />}
          {telaAtiva === 'movimentacao' && <Movimentacao usuario={user} aoSucesso={() => navegarPara('dashboard')} />}
          {telaAtiva === 'historico' && <Historico />}
      </main>
      
    </div>
  );
}