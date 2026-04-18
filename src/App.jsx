import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function App() {
  // 📦 PRODUTOS
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [stock, setStock] = useState("");
  const [editId, setEditId] = useState(null);

  // 🔐 LOGIN
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🛒 CARRINHO
  const [cart, setCart] = useState([]);

  // 🧾 VENDAS
  const [vendas, setVendas] = useState([]);

  // 📊 RELATÓRIO
  const [report, setReport] = useState([]);

  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 🔐 LOGIN
  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return setErrorMsg(error.message);
    setUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // 👤 CHECK USER
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    check();
  }, []);

  // 📦 PRODUTOS
  const fetchProdutos = async () => {
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .order("id", { ascending: false });

    setProdutos(data || []);
  };

  // 🧾 VENDAS
  const fetchVendas = async () => {
    const { data } = await supabase
      .from("vendas")
      .select("*")
      .order("id", { ascending: false });

    setVendas(data || []);
  };

  // 📊 RELATÓRIO
  const fetchReport = async () => {
    const { data } = await supabase.from("vendas").select("*");

    const grouped = {};

    (data || []).forEach((v) => {
      if (!grouped[v.produto_nome]) {
        grouped[v.produto_nome] = {
          produto: v.produto_nome,
          quantidade: 0,
          total: 0,
        };
      }

      grouped[v.produto_nome].quantidade += Number(v.quantidade);
      grouped[v.produto_nome].total += Number(v.total);
    });

    setReport(Object.values(grouped));
  };

  useEffect(() => {
    fetchProdutos();
    fetchVendas();
    fetchReport();
  }, []);

  // ➕ ADD OU EDIT
  const saveProduto = async () => {
    if (editId) {
      await supabase
        .from("produtos")
        .update({
          nome,
          preco: Number(preco),
          stock: Number(stock),
        })
        .eq("id", editId);
    } else {
      await supabase.from("produtos").insert([
        {
          nome,
          preco: Number(preco),
          stock: Number(stock),
        },
      ]);
    }

    setNome("");
    setPreco("");
    setStock("");
    setEditId(null);
    fetchProdutos();
  };

  // ❌ DELETE
  const deleteProduto = async (id) => {
    const ok = window.confirm("Eliminar produto?");
    if (!ok) return;

    await supabase.from("produtos").delete().eq("id", id);
    fetchProdutos();
  };

  // ✏️ EDIT START
  const startEdit = (p) => {
    setEditId(p.id);
    setNome(p.nome);
    setPreco(p.preco);
    setStock(p.stock);
  };

  // 🛒 ADD CART
  const addToCart = (p) => {
    const existe = cart.find((c) => c.id === p.id);

    if (existe) {
      setCart(
        cart.map((c) =>
          c.id === p.id ? { ...c, quantidade: c.quantidade + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...p, quantidade: 1 }]);
    }
  };

  // 💰 VENDER
  const confirmarVenda = async () => {
    for (const item of cart) {
      await supabase.from("vendas").insert([
        {
          produto_nome: item.nome,
          quantidade: item.quantidade,
          total: item.preco * item.quantidade,
          created_at: new Date(),
        },
      ]);

      await supabase
        .from("produtos")
        .update({
          stock: item.stock - item.quantidade,
        })
        .eq("id", item.id);
    }

    setCart([]);
    fetchProdutos();
    fetchVendas();
    fetchReport();
  };

  // FILTER
  const filtered = produtos.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  // LOGIN SCREEN
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>🔐 Login</h2>

        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} />

        <button onClick={login} style={btn}>Entrar</button>

        <p style={{ color: "red" }}>{errorMsg}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h1>🍰 Confeitaria POS</h1>

      <p>👤 {user.email}</p>

      <button onClick={logout}>Sair</button>

      {/* PRODUTOS */}
      <h2>📦 Produtos</h2>

      <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} style={input} />
      <input placeholder="Preço" value={preco} onChange={(e) => setPreco(e.target.value)} style={input} />
      <input placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} style={input} />

      <button onClick={saveProduto} style={btn}>
        {editId ? "✏️ Atualizar" : "➕ Adicionar"}
      </button>

      {/* LISTA */}
      {filtered.map((p) => (
        <div key={p.id} style={card}>
          <b>{p.nome}</b>
          <p>{p.preco} MT | Stock: {p.stock}</p>

          <button onClick={() => addToCart(p)} style={{ background: "blue", color: "white" }}>
            ➕ Vender
          </button>

          <button onClick={() => startEdit(p)} style={{ marginLeft: 5 }}>
            ✏️ Editar
          </button>

          <button onClick={() => deleteProduto(p.id)} style={{ marginLeft: 5, color: "red" }}>
            ❌ Apagar
          </button>
        </div>
      ))}

      {/* CARRINHO */}
      <h2>🛒 Venda</h2>

      {cart.map((item) => (
        <div key={item.id} style={card}>
          <b>{item.nome}</b>
          <input
            type="number"
            value={item.quantidade}
            onChange={(e) => {
              const qtd = Number(e.target.value);
              setCart(
                cart.map((c) =>
                  c.id === item.id ? { ...c, quantidade: qtd } : c
                )
              );
            }}
          />
        </div>
      ))}

      <button onClick={confirmarVenda} style={{ ...btn, background: "green" }}>
        💰 Confirmar Venda
      </button>

      {/* RELATÓRIO */}
      <h2>📊 Relatório</h2>

      {report.map((r, i) => (
        <div key={i} style={card}>
          <b>{r.produto}</b>
          <p>{r.quantidade} un</p>
          <p>{r.total} MT</p>
        </div>
      ))}

      {/* HISTÓRICO */}
      <h2>🧾 Histórico</h2>

      {vendas.map((v) => (
        <div key={v.id} style={card}>
          <b>{v.produto_nome}</b>
          <p>{v.quantidade}</p>
          <p>{v.total} MT</p>
          <small>{new Date(v.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

// STYLE
const input = {
  display: "block",
  marginBottom: 8,
  width: "100%",
  padding: 8,
};

const btn = {
  width: "100%",
  padding: 10,
  background: "black",
  color: "white",
};

const card = {
  border: "1px solid #ddd",
  padding: 10,
  marginBottom: 10,
};