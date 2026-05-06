import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';

export default function Movimentacao({ usuario, aoSucesso }) {
  const [catalogo, setCatalogo] = useState([]);
  const [lotesDisponiveis, setLotesDisponiveis] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    tipo: 'E', // 'E' para Entrada, 'S' para Saída
    insumo_id: '',
    nome_insumo: '',
    lote: '',
    validade: '',
    quantidade: '',
    finalidade: '',
    lote_id_saida: '' // Usado apenas na saída para saber qual doc atualizar
  });

  // Carrega o catálogo ao abrir a tela
  useEffect(() => {
    const carregarCatalogo = async () => {
      const snap = await getDocs(collection(db, "insumos"));
      const dados = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Ordena por nome para facilitar a busca no select
      setCatalogo(dados.sort((a, b) => a.nome.localeCompare(b.nome)));
    };
    carregarCatalogo();
  }, []);

  // Quando o usuário escolhe um insumo e a operação é "Saída", busca os lotes com saldo
  useEffect(() => {
    if (form.tipo === 'S' && form.insumo_id) {
      const carregarLotesValidos = async () => {
        const q = query(
          collection(db, "lotes"), 
          where("insumo_id", "==", form.insumo_id),
          where("quantidade", ">", 0)
        );
        const snap = await getDocs(q);
        
        // Pega os lotes e já filtra para remover os vencidos!
        const hoje = new Date();
        hoje.setHours(0,0,0,0);

        const lotesFiltrados = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(lote => new Date(lote.validade + 'T00:00:00') >= hoje); // Só passa se for >= hoje

        setLotesDisponiveis(lotesFiltrados);
      };
      carregarLotesValidos();
    } else {
      setLotesDisponiveis([]);
    }
  }, [form.insumo_id, form.tipo]);

  const handleInsumoChange = (e) => {
    const id = e.target.value;
    const item = catalogo.find(i => i.id === id);
    setForm({ ...form, insumo_id: id, nome_insumo: item ? item.nome : '', lote: '', validade: '', lote_id_saida: '' });
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setLoading(true);
    const qtd = parseInt(form.quantidade);

    try {
      if (form.tipo === 'E') {
        // ---- LÓGICA DE ENTRADA ----
        // 1. Verifica se já existe um lote com esse nome para esse insumo
        const qLote = query(
          collection(db, "lotes"), 
          where("insumo_id", "==", form.insumo_id),
          where("lote", "==", form.lote)
        );
        const snapLote = await getDocs(qLote);

        if (!snapLote.empty) {
          // Lote já existe: apenas soma a quantidade
          const loteDoc = snapLote.docs[0];
          const novaQtd = loteDoc.data().quantidade + qtd;
          await updateDoc(doc(db, "lotes", loteDoc.id), { quantidade: novaQtd });
        } else {
          // Lote novo: cria o registro no estoque físico
          await addDoc(collection(db, "lotes"), {
            insumo_id: form.insumo_id,
            lote: form.lote,
            validade: form.validade,
            quantidade: qtd
          });
        }
      } else {
        // ---- LÓGICA DE SAÍDA ----
        // 1. Encontra o lote selecionado
        const loteSelecionado = lotesDisponiveis.find(l => l.id === form.lote_id_saida);
        if (!loteSelecionado) throw new Error("Selecione um lote válido para a saída.");
        
        if (qtd > loteSelecionado.quantidade) {
          throw new Error(`Quantidade indisponível! O lote ${loteSelecionado.lote} possui apenas ${loteSelecionado.quantidade} unidades.`);
        }

        // 2. Subtrai a quantidade
        await updateDoc(doc(db, "lotes", form.lote_id_saida), {
          quantidade: loteSelecionado.quantidade - qtd
        });
        
        // Passa o nome do lote para o histórico
        form.lote = loteSelecionado.lote; 
      }

      // ---- REGISTRA A AUDITORIA (HISTÓRICO) ----
      await addDoc(collection(db, "movimentacoes"), {
        tipo: form.tipo,
        insumo_id: form.insumo_id,
        nome_insumo: form.nome_insumo,
        lote: form.lote,
        quantidade: qtd,
        finalidade: form.finalidade,
        usuario: usuario.nome, // Vem das props do App.jsx
        data_hora: new Date().toISOString()
      });

      alert("✅ Movimentação registrada com sucesso!");
      if(aoSucesso) aoSucesso(); // Volta para o Dashboard

    } catch (err) {
      alert("❌ Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 mx-auto" style={{maxWidth: '800px'}}>
      <header className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Registro de Movimentação</h3>
        <p className="text-muted">Entrada de novos lotes ou baixa de insumos</p>
      </header>

      <form onSubmit={handleSalvar}>
        {/* TIPO DE MOVIMENTAÇÃO */}
        <div className="d-flex gap-3 mb-4 p-3 bg-light rounded border">
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" name="tipo" id="entrada" 
                   checked={form.tipo === 'E'} onChange={() => setForm({...form, tipo: 'E', lote: '', validade: '', lote_id_saida: ''})} />
            <label className="form-check-label fw-bold text-success" htmlFor="entrada">
              <i className="bi bi-box-arrow-in-down me-1"></i> Entrada (Recebimento)
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="radio" name="tipo" id="saida" 
                   checked={form.tipo === 'S'} onChange={() => setForm({...form, tipo: 'S', lote: '', validade: '', lote_id_saida: ''})} />
            <label className="form-check-label fw-bold text-danger" htmlFor="saida">
              <i className="bi bi-box-arrow-up me-1"></i> Saída (Consumo/Baixa)
            </label>
          </div>
        </div>

        <div className="row g-3">
          {/* SELEÇÃO DO PRODUTO BASE */}
          <div className="col-md-12">
            <label className="form-label fw-bold">Produto Base (Catálogo) *</label>
            <select className="form-select bg-light" required value={form.insumo_id} onChange={handleInsumoChange}>
              <option value="">-- Selecione o Insumo --</option>
              {catalogo.map(item => (
                <option key={item.id} value={item.id}>
                  {item.nome} - {item.caracteristica}
                </option>
              ))}
            </select>
          </div>

          {/* CAMPOS DINÂMICOS: ENTRADA vs SAÍDA */}
          {form.tipo === 'E' ? (
            <>
              <div className="col-md-6">
                <label className="form-label fw-bold">Número do Lote *</label>
                <input type="text" className="form-control" required 
                       placeholder="Ex: L-1234"
                       value={form.lote} onChange={e => setForm({...form, lote: e.target.value.toUpperCase()})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Validade do Lote *</label>
                <input type="date" className="form-control" required 
                       value={form.validade} onChange={e => setForm({...form, validade: e.target.value})} />
              </div>
            </>
          ) : (
            <div className="col-md-12">
              <label className="form-label fw-bold">Selecione o Lote para Baixa *</label>
              <select className="form-select border-danger-subtle" required 
                      value={form.lote_id_saida} onChange={e => setForm({...form, lote_id_saida: e.target.value})}
                      disabled={!form.insumo_id}>
                <option value="">-- Escolha de qual lote retirar --</option>
                {lotesDisponiveis.map(l => (
                  <option key={l.id} value={l.id}>
                    Lote: {l.lote} | Vence em: {l.validade.split('-').reverse().join('/')} | Saldo: {l.quantidade} un.
                  </option>
                ))}
              </select>
              {form.insumo_id && lotesDisponiveis.length === 0 && (
                <div className="text-danger small mt-1"><i className="bi bi-exclamation-triangle"></i> Nenhum lote com saldo disponível para este produto.</div>
              )}
            </div>
          )}

          {/* QUANTIDADE E FINALIDADE */}
          <div className="col-md-4">
            <label className="form-label fw-bold">Quantidade *</label>
            <input type="number" className="form-control" required min="1" 
                   value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} />
          </div>
          
          <div className="col-md-8">
            <label className="form-label fw-bold">Finalidade / Observação *</label>
            <input type="text" className="form-control" required 
                   placeholder={form.tipo === 'E' ? "Ex: Compra Nota Fiscal 123" : "Ex: Setor de Triagem / Paciente X"}
                   value={form.finalidade} onChange={e => setForm({...form, finalidade: e.target.value})} />
          </div>

          {/* BOTÃO SALVAR */}
          <div className="col-12 mt-4 text-end">
            <button type="submit" className={`btn px-5 fw-bold text-white ${form.tipo === 'E' ? 'btn-success' : 'btn-danger'}`} disabled={loading}>
              {loading ? 'Processando...' : (form.tipo === 'E' ? 'Registrar Entrada' : 'Registrar Saída')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}