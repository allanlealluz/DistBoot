import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const [catalogo, setCatalogo] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [busca, setBusca] = useState('');
  const [expandidos, setExpandidos] = useState({});

  useEffect(() => {
    const unsubCat = onSnapshot(collection(db, "insumos"), (snap) => setCatalogo(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubLotes = onSnapshot(collection(db, "lotes"), (snap) => setLotes(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubCat(); unsubLotes(); };
  }, []);

  const toggleExpandir = (id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));

  // Função auxiliar para saber se a data de hoje passou da validade
  const isVencido = (dataValidade) => {
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    return new Date(dataValidade + 'T00:00:00') < hoje;
  };

  const catalogoFiltrado = catalogo.filter(i => i.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="fade-in">
      <header className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Painel Logístico</h2>
          <p className="text-muted mb-0">Visão de Estoque Útil vs Vencido</p>
        </div>
        <div className="input-group w-25 shadow-sm">
          <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
          <input type="text" className="form-control border-start-0" placeholder="Buscar produto..." onChange={e => setBusca(e.target.value)} />
        </div>
      </header>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th className="px-4 py-3" style={{width: '50px'}}></th>
                <th>Insumo Base</th>
                <th className="text-center">Mínimo</th>
                <th className="text-center">Estoque ÚTIL</th>
                <th className="text-center">Lotes Vencidos</th>
                <th className="px-4 text-center">Status Operacional</th>
              </tr>
            </thead>
            <tbody>
              {catalogoFiltrado.map(produto => {
                const lotesDoProduto = lotes.filter(l => l.insumo_id === produto.id && l.quantidade > 0);
                
                // --- A NOVA MÁGICA ACONTECE AQUI ---
                let estoqueUtil = 0;
                let estoquePerdido = 0;
                let temLoteVencido = false;

                lotesDoProduto.forEach(lote => {
                  if (isVencido(lote.validade)) {
                    estoquePerdido += lote.quantidade;
                    temLoteVencido = true;
                  } else {
                    estoqueUtil += lote.quantidade;
                  }
                });

                const isExpandido = expandidos[produto.id];

                // Lógica de Status Baseado APENAS no Estoque Útil
                let statusBadge;
                if (estoqueUtil === 0) {
                  statusBadge = <span className="badge bg-dark">🚫 ZERADO (Falta!)</span>;
                } else if (estoqueUtil <= produto.estoque_minimo) {
                  statusBadge = <span className="badge bg-warning text-dark">⚠️ COMPRAR (Baixo)</span>;
                } else {
                  statusBadge = <span className="badge bg-primary-subtle text-primary border">✅ Estoque OK</span>;
                }

                return (
                  <React.Fragment key={produto.id}>
                    <tr className={isExpandido ? 'table-light' : 'bg-white'}>
                      <td className="px-4 text-center">
                        <button onClick={() => toggleExpandir(produto.id)} className="btn btn-sm btn-light border rounded-circle">
                          <i className={`bi bi-chevron-${isExpandido ? 'up' : 'down'}`}></i>
                        </button>
                      </td>
                      <td>
                        <div className="fw-bold text-dark fs-6">{produto.nome}</div>
                        <small className="text-muted">{produto.caracteristica}</small>
                      </td>
                      <td className="text-center text-muted">{produto.estoque_minimo}</td>
                      
                      {/* Mostra apenas a quantidade boa para uso */}
                      <td className="text-center">
                        <span className={`fs-5 fw-bold ${estoqueUtil <= produto.estoque_minimo ? 'text-danger' : 'text-success'}`}>
                          {estoqueUtil}
                        </span>
                      </td>

                      {/* Alerta de Lotes Vencidos na linha principal */}
                      <td className="text-center">
                        {temLoteVencido ? (
                          <span className="badge bg-danger rounded-pill px-3 py-2 animate-pulse" title="Descartar imediatamente!">
                            {estoquePerdido} perdidos!
                          </span>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>

                      <td className="px-4 text-center">{statusBadge}</td>
                    </tr>

                    {/* SUB-LINHAS (Lotes Expandidos) */}
                    {isExpandido && (
                      <tr>
                        <td colSpan="6" className="p-0 border-bottom-0">
                          <div className="bg-light p-3 border-start border-primary border-4 ms-4 my-2 rounded-end">
                            <h6 className="fw-bold text-secondary mb-2 small text-uppercase">Lotes Físicos na Prateleira</h6>
                            <table className="table table-sm table-borderless mb-0">
                              <tbody>
                                {lotesDoProduto.map(lote => {
                                  const vencido = isVencido(lote.validade);
                                  return (
                                    <tr key={lote.id}>
                                      <td className="fw-bold">{lote.lote}</td>
                                      <td className={vencido ? 'text-danger fw-bold' : ''}>Vence: {lote.validade.split('-').reverse().join('/')}</td>
                                      <td className="fw-bold">{lote.quantidade} un.</td>
                                      <td>{vencido ? <span className="badge bg-danger">VENCIDO</span> : <span className="badge bg-success">Útil</span>}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}