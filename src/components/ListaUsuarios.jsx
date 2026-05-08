import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

export default function ListaUsuarios({ usuarioLogado }) {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');

  // Sincroniza a lista com o Firebase em tempo real
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "usuarios"), (snap) => {
      setUsuarios(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Função para deletar um usuário do banco
  const deletarUsuario = async (id, nome) => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o usuário ${nome}?`);
    
    if (confirmacao) {
      try {
        await deleteDoc(doc(db, "usuarios", id));
        alert("Usuário removido com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao tentar excluir o usuário.");
      }
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nome.toLowerCase().includes(busca.toLowerCase()) || 
    u.usuario.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="fade-in">
      <header className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Equipe e Usuários</h2>
          <p className="text-muted mb-0">Gestão de acessos ao sistema</p>
        </div>
        <div className="input-group w-25 shadow-sm">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Buscar usuário..." 
            onChange={e => setBusca(e.target.value)} 
          />
        </div>
      </header>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3">Nome do Colaborador</th>
                <th>Login de Acesso</th>
                <th className="text-center">Nível</th>
                {/* SÓ MOSTRA O TÍTULO DA COLUNA SE FOR ADM */}
                {usuarioLogado?.role === 'admin' && <th className="text-center">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(user => (
                <tr key={user.id}>
                  <td className="px-4 fw-bold text-dark">{user.nome}</td>
                  <td>
                    <span className="badge bg-secondary rounded-pill px-3 py-2">
                      @{user.usuario}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-info'}`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  
                  {/* BOTÃO DE DELETAR: Só aparece se o admin estiver logado e NÃO for o próprio perfil */}
                  {usuarioLogado?.role === 'admin' && (
                    <td className="text-center">
                      <button 
                        onClick={() => deletarUsuario(user.id, user.nome)}
                        className="btn btn-outline-danger btn-sm"
                        disabled={user.id === usuarioLogado.id} // Impede de se auto-deletar
                      >
                        Excluir
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}