import { useState } from "react";

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [stock, setStock] = useState("");

  const adicionarProduto = () => {
    if (!nome || !preco || !stock) return;

    const novoProduto = {
      id: Date.now(),
      nome,
      preco: Number(preco),
      stock: Number(stock),
    };

    setProdutos([...produtos, novoProduto]);
    setNome("");
    setPreco("");
    setStock("");
  };

  const removerProduto = (id) => {
    setProdutos(produtos.filter((p) => p.id !== id));
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", fontFamily: "Arial" }}>
      <h1>🍰 Gestão de Confeitaria</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <br />

        <input
          placeholder="Preço"
          type="number"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />
        <br />

        <input
          placeholder="Stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
        <br />

        <button onClick={adicionarProduto}>Adicionar</button>
      </div>

      {produtos.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <h3>{p.nome}</h3>
          <p>Preço: {p.preco} MT</p>
          <p>Stock: {p.stock}</p>

          <button onClick={() => removerProduto(p.id)}>
            Remover
          </button>
        </div>
      ))}
    </div>
  );
}