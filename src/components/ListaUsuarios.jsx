import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    // onSnapshot mantém a tabela atualizada em tempo real se alguém se cadastrar
    const unsub = onSnapshot(collection(db, "usuarios"), (snap) => {
      setUsuarios(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

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
                <th className="text-center">ID do Sistema</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">Nenhum usuário encontrado.</td>
                </tr>
              ) : (
                usuariosFiltrados.map(user => (
                  <tr key={user.id}>
                    <td className="px-4 fw-bold text-dark">{user.nome}</td>
                    <td>
                      <span className="badge bg-secondary rounded-pill px-3 py-2">
                        @{user.usuario}
                      </span>
                    </td>
                    <td className="text-center text-muted small font-monospace">
                      {user.id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}