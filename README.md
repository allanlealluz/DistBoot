<div align="center">
  <img src="public/distboot.png" alt="Logo Distboot" width="200" />
  
  # Distboot
  **Sistema de Gestão de Estoque Hospitalar**
</div>

---

## Visão Geral

O Distboot é uma aplicação web desenvolvida para o gerenciamento crítico de insumos médicos e hospitalares. O foco do sistema é a segurança do paciente e a rastreabilidade total, implementando controle rigoroso por lotes, travas de segurança contra produtos vencidos e auditoria imutável de todas as movimentações de estoque.

---

## Funcionalidades Principais

### Rastreabilidade e Controle de Lotes
* **Gestão Focada no Lote Físico:** As entradas e saídas não ocorrem apenas no "produto", mas sim em lotes específicos. Isso garante saber exatamente de qual caixa o material foi retirado.
* **Trava de Segurança (Validade):** O sistema oculta e bloqueia sistemicamente o uso de lotes que estejam com a data de validade expirada no momento do registro de saída.
* **Painel Logístico Analítico:** O Dashboard calcula em tempo real o que é "Estoque Útil" (lotes no prazo e com saldo) e separa visualmente o saldo de materiais perdidos/vencidos.

### Gestão de Catálogo e Auditoria
* **Ciclo de Vida do Insumo (Soft Delete):** Permite inativar produtos que não são mais comprados pela instituição. O item some das opções de novas movimentações, mas mantém a integridade de todo o seu histórico passado.
* **Alertas de Reposição:** Monitoramento baseado em um nível de "estoque mínimo" customizável para cada tipo de material.
* **Auditoria Contínua:** Registro de todas as transações de Entrada e Saída contendo data, hora exata, usuário responsável, lote afetado, quantidade e a finalidade da movimentação.

---

## Arquitetura de Dados (NoSQL)

A estrutura de dados foi projetada visando alta performance e integridade de registros históricos. A lógica divide-se em três pilares fundamentais:

1. **Catálogo Base (`insumos`)**
   Armazena as definições primárias do material: Nome, característica, material de composição, estoque mínimo de alerta e o status (Ativo/Inativo).

2. **Estoque Físico (`lotes`)**
   Entidade vinculada ao catálogo. Um único insumo pode possuir múltiplos lotes simultâneos na prateleira, cada um com sua própria data de validade e quantidade de saldo.

3. **Histórico (`movimentacoes`)**
   Registro transacional. Utiliza a técnica de desnormalização controlada (salvando metadados no momento da ação) para garantir que uma consulta ao histórico seja rápida e mostre os dados exatos daquele momento no tempo, imunes a edições posteriores no catálogo.

---

## Tecnologias Empregadas

* **Interface de Usuário:** React.js
* **Estilização e Componentização:** Bootstrap 5
* **Banco de Dados e Backend:** Firebase Cloud Firestore
