import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CadastroInsumo from './components/CadastroInsumo'; 
import Movimentacao from './components/Movimentacao';
import Historico from './components/Historico';
import Perfil from './components/Perfil';
import ListaUsuarios from './components/ListaUsuarios';

export default function App() {
  const [user, setUser] = useState(null);
  const [telaAtiva, setTelaAtiva] = useState('dashboard');
  
  // Novo estado para controlar se o menu está aberto no celular
  const [menuAberto, setMenuAberto] = useState(false);

  if (!user) return <Login onLogin={(dadosUsuario) => setUser(dadosUsuario)} />;

  const navegarPara = (tela) => {
    setTelaAtiva(tela);
    setMenuAberto(false); // Fecha o menu automaticamente no celular ao trocar de tela
  };

  return (
    <div className="d-flex vw-100 vh-100 overflow-hidden bg-light position-relative">
      
      {/* BLOCO DE ESTILO RESPONSIVO 
        Garante que no PC o menu fique fixo, e no celular ele ganhe posição absoluta e deslize 
      */}
      <style>{`
        .sidebar-custom {
          width: 260px;
          background-color: #0f172a;
          z-index: 1050;
          transition: transform 0.3s ease-in-out;
        }
        @media (max-width: 767.98px) {
          .sidebar-custom {
            position: fixed;
            height: 100vh;
            transform: translateX(${menuAberto ? '0' : '-100%'});
          }
        }
        @media (min-width: 768px) {
          .sidebar-custom {
            position: static;
            transform: none;
          }
        }
      `}</style>

      {/* OVERLAY ESCURO PARA MOBILE (Clica fora do menu para fechar) */}
      {menuAberto && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none" 
          style={{ zIndex: 1040 }}
          onClick={() => setMenuAberto(false)}
        ></div>
      )}

      {/* SIDEBAR RESPONSIVA */}
      <aside className="sidebar-custom d-flex flex-column p-3 text-white shadow-lg flex-shrink-0">
        
        {/* TOPO: LOGO */}
        <div className="mb-4 text-center d-flex flex-column align-items-center position-relative">
          {/* Botão de fechar (X) apenas visível no mobile */}
          <button 
            onClick={() => setMenuAberto(false)} 
            className="btn btn-link text-white position-absolute top-0 end-0 d-md-none p-0"
          >
            <i className="bi bi-x-lg fs-5"></i>
          </button>

          <img src="/distboot.png" alt="DistBoot Logo" style={{ width: '130px', objectFit: 'contain' }} className="mb-2 mt-2" />
          <div className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
            Gestão Hospitalar
          </div>
        </div>
        
        {/* MEIO: NAVEGAÇÃO COM SCROLL */}
        <nav className="flex-grow-1 overflow-y-auto pe-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>
          <ul className="nav nav-pills flex-column gap-1">
            <li className="nav-item">
              <button onClick={() => navegarPara('dashboard')} 
                      className={`nav-link w-100 text-start py-2 px-3 rounded-3 border-0 d-flex align-items-center transition-all ${telaAtiva === 'dashboard' ? 'active bg-primary text-white shadow-sm' : 'text-white-50 bg-transparent'}`}>
                <i className="bi bi-grid-1x2-fill me-3 fs-6"></i> Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => navegarPara('cadastro')} 
                      className={`nav-link w-100 text-start py-2 px-3 rounded-3 border-0 d-flex align-items-center transition-all ${telaAtiva === 'cadastro' ? 'active bg-primary text-white shadow-sm' : 'text-white-50 bg-transparent'}`}>
                <i className="bi bi-plus-circle-fill me-3 fs-6"></i> Gestão de Insumos
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => navegarPara('movimentacao')} 
                      className={`nav-link w-100 text-start py-2 px-3 rounded-3 border-0 d-flex align-items-center transition-all ${telaAtiva === 'movimentacao' ? 'active bg-primary text-white shadow-sm' : 'text-white-50 bg-transparent'}`}>
                <i className="bi bi-arrow-left-right me-3 fs-6"></i> Movimentações
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => navegarPara('historico')} 
                      className={`nav-link w-100 text-start py-2 px-3 rounded-3 border-0 d-flex align-items-center transition-all ${telaAtiva === 'historico' ? 'active bg-primary text-white shadow-sm' : 'text-white-50 bg-transparent'}`}>
                <i className="bi bi-clock-history me-3 fs-6"></i> Auditoria
              </button>
            </li>
            
            <li className="nav-item mt-3 mb-1">
              <small className="text-uppercase text-white-50 fw-bold px-3" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Administração</small>
            </li>
            
            <li className="nav-item">
              <button onClick={() => navegarPara('usuarios')} 
                      className={`nav-link w-100 text-start py-2 px-3 rounded-3 border-0 d-flex align-items-center transition-all ${telaAtiva === 'usuarios' ? 'active bg-primary text-white shadow-sm' : 'text-white-50 bg-transparent'}`}>
                <i className="bi bi-people-fill me-3 fs-6"></i> Equipe
              </button>
            </li>
          </ul>
        </nav>
        
        {/* RODAPÉ DO MENU */}
        <div className="mt-3 border-top border-secondary border-opacity-50 pt-3">
          <button 
            onClick={() => navegarPara('perfil')} 
            className="btn btn-link text-decoration-none p-2 w-100 text-start mb-2 d-flex align-items-center rounded-3"
            style={{ backgroundColor: telaAtiva === 'perfil' ? 'rgba(255,255,255,0.1)' : 'transparent', transition: 'background-color 0.2s' }}
          >
            <div className="bg-gradient-primary bg-primary rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm text-white fw-bold" 
                 style={{width: '36px', height: '36px', fontSize: '1rem'}}>
               {user.nome.charAt(0).toUpperCase()}
            </div>
            <div className="text-white overflow-hidden">
               <div className="fw-bold mb-0 text-truncate" style={{ fontSize: '0.85rem' }}>{user.nome}</div>
               <small className="text-white-50" style={{ fontSize: '0.75rem' }}>Ver perfil</small>
            </div>
          </button>
          
          <button onClick={() => setUser(null)} className="btn btn-outline-danger btn-sm w-100 py-2 fw-bold rounded-3 d-flex align-items-center justify-content-center border-opacity-50">
             <i className="bi bi-box-arrow-left me-2 fs-6"></i> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* CAIXA DIREITA: CABEÇALHO MOBILE + ÁREA DE CONTEÚDO */}
      <main className="flex-grow-1 h-100 d-flex flex-column bg-light overflow-hidden">
        
        {/* CABEÇALHO SUPERIOR (Visível apenas em Mobile) */}
        <header className="d-md-none bg-white shadow-sm p-3 d-flex align-items-center justify-content-between z-index-1">
          <button onClick={() => setMenuAberto(true)} className="btn btn-light border-0 px-2 py-1 shadow-sm">
            <i className="bi bi-list fs-4"></i>
          </button>
          <span className="fw-bold text-dark fs-5">DistBoot</span>
          <div style={{width: '40px'}}></div> {/* Usado apenas para manter o título centralizado */}
        </header>

        {/* TELAS DO SISTEMA */}
        <div className="flex-grow-1 overflow-auto p-3 p-md-5">
            {telaAtiva === 'dashboard' && <Dashboard />}
            {telaAtiva === 'cadastro' && <CadastroInsumo aoSucesso={() => navegarPara('dashboard')} />}
            {telaAtiva === 'movimentacao' && <Movimentacao usuario={user} aoSucesso={() => navegarPara('dashboard')} />}
            {telaAtiva === 'historico' && <Historico />}
            {telaAtiva === 'usuarios' && <ListaUsuarios />}
            {telaAtiva === 'perfil' && <Perfil usuarioId={user.id} onPerfilAtualizado={(novoNome) => setUser({...user, nome: novoNome})} />}
        </div>

      </main>
      
    </div>
  );
}