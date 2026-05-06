import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function Historico() {
  const [historico, setHistorico] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    // Busca as movimentações ordenando pela data (mais recente primeiro)
    const q = query(collection(db, "movimentacoes"), orderBy("data_hora", "desc"));
    
    return onSnapshot(q, (snap) => {
      setHistorico(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  // Função para deixar a data no formato brasileiro (DD/MM/AAAA HH:MM)
  const formatarDataHora = (isoString) => {
    if (!isoString) return '--';
    const data = new Date(isoString);
    return data.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  // Filtra pelo nome do insumo, lote ou usuário
  const historicoFiltrado = historico.filter(item => 
    item.nome_insumo?.toLowerCase().includes(busca.toLowerCase()) ||
    item.usuario?.toLowerCase().includes(busca.toLowerCase()) ||
    item.lote?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="fade-in">
      <header className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Auditoria e Rastreabilidade</h2>
          <p className="text-muted mb-0">Histórico completo de entradas e saídas de lotes</p>
        </div>
        <div className="input-group w-25 shadow-sm">
          <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
          <input 
            type="text" 
            className="form-control border-start-0" 
            placeholder="Buscar por insumo, lote ou usuário..." 
            value={busca}
            onChange={e => setBusca(e.target.value)} 
          />
        </div>
      </header>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th className="px-4 py-3">Data e Hora</th>
                <th>Operação</th>
                <th>Insumo</th>
                <th>Lote</th>
                <th className="text-center">Qtd</th>
                <th>Usuário / Responsável</th>
                <th className="px-4">Finalidade / Observação</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {historicoFiltrado.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                    Nenhum registro de movimentação encontrado.
                  </td>
                </tr>
              ) : (
                historicoFiltrado.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 text-muted small fw-bold">
                      {formatarDataHora(item.data_hora)}
                    </td>
                    <td>
                      {item.tipo === 'E' ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                          <i className="bi bi-arrow-down-circle-fill me-1"></i> ENTRADA
                        </span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2">
                          <i className="bi bi-arrow-up-circle-fill me-1"></i> SAÍDA
                        </span>
                      )}
                    </td>
                    <td className="fw-bold text-dark">{item.nome_insumo}</td>
                    <td><code className="text-secondary bg-light px-2 py-1 rounded border">{item.lote}</code></td>
                    <td className="text-center fw-bold fs-6">{item.quantidade}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-secondary text-white rounded-circle d-flex justify-content-center align-items-center me-2" style={{width: '24px', height: '24px', fontSize: '10px'}}>
                          {item.usuario ? item.usuario.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="small">{item.usuario || 'Sistema'}</span>
                      </div>
                    </td>
                    <td className="px-4 text-muted small">{item.finalidade}</td>
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