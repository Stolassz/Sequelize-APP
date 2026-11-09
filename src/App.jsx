/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(body.erro || body.message || "Operação não concluída.");
  return body;
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });
const api = {
  login: (data) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  createUser: (data) =>
    request("/usuarios", { method: "POST", body: JSON.stringify(data) }),
  requestCode: (email) =>
    request("/usuarios/solicitar", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  verify: (data) =>
    request("/usuarios/verificar", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  students: (token) => request("/alunos", { headers: auth(token) }),
  users: (token) => request("/usuarios", { headers: auth(token) }),
  addresses: (token) => request("/enderecos", { headers: auth(token) }),
  createAddress: (token, data) =>
    request("/enderecos", {
      method: "POST",
      headers: auth(token),
      body: JSON.stringify(data),
    }),
  createStudent: (token, data) =>
    request("/alunos", {
      method: "POST",
      headers: auth(token),
      body: JSON.stringify(data),
    }),
};

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <i className="bi bi-mortarboard-fill" />
      </span>
      gt<span className="text-primary">school</span>
    </div>
  );
}

function Notice({ message, success = false }) {
  return (
    message && (
      <div className={`alert alert-${success ? "success" : "danger"}`}>
        {message}
      </div>
    )
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
  onBlur,
}) {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold small">{label}</label>
      <input
        className="form-control form-control-lg"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function AuthShell({ children }) {
  return (
    <main className="auth-page">
      <div className="container py-4">
        <Brand />
        <div className="row justify-content-center align-items-center auth-content">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="auth-card">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Login({ onLogin, onRegister, onVerify }) {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const result = await api.login(form);
      onLogin(result.token, form.email);
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <AuthShell>
      <div className="text-center mb-4">
        <div className="welcome-icon">
          <i className="bi bi-person-lock" />
        </div>
        <h1 className="h3 fw-bold mt-3">Bem-vindo de volta!</h1>
        <p className="text-secondary">Entre para continuar sua jornada.</p>
      </div>
      <Notice message={error} />
      <form onSubmit={submit}>
        <Field
          label="E-mail"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          placeholder="voce@exemplo.com"
        />
        <Field
          label="Senha"
          type="password"
          value={form.senha}
          onChange={(v) => setForm({ ...form, senha: v })}
          placeholder="Digite sua senha"
        />
        <div className="text-end mb-3">
          <button type="button" className="btn btn-link p-0" onClick={onVerify}>
            Verificar e-mail
          </button>
        </div>
        <button className="btn btn-primary btn-lg w-100">Entrar</button>
      </form>
      <p className="text-center text-secondary mt-4 mb-0">
        Ainda não tem uma conta?{" "}
        <button className="btn btn-link p-0" onClick={onRegister}>
          Criar conta
        </button>
      </p>
    </AuthShell>
  );
}

function Register({ onCreated, onBack }) {
  const [form, setForm] = useState({ email: "", senha: "", role: "aluno" });
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.senha !== confirm) return setError("As senhas não conferem.");
    try {
      await api.createUser(form);
      await api.requestCode(form.email);
      onCreated(form.email);
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <AuthShell>
      <button className="btn btn-link px-0 mb-3" onClick={onBack}>
        <i className="bi bi-arrow-left me-2" />
        Voltar
      </button>
      <h1 className="h3 fw-bold">Crie sua conta</h1>
      <p className="text-secondary">Faça parte da comunidade gt-school.</p>
      <Notice message={error} />
      <form onSubmit={submit}>
        <Field
          label="E-mail"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          placeholder="voce@exemplo.com"
        />
        <Field
          label="Senha"
          type="password"
          value={form.senha}
          onChange={(v) => setForm({ ...form, senha: v })}
          placeholder="Mínimo de 6 caracteres"
        />
        <Field
          label="Confirme sua senha"
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Repita sua senha"
        />
        <label className="form-label fw-semibold small">Perfil</label>
        <select
          className="form-select form-select-lg mb-4"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="aluno">Aluno</option>
          <option value="professor">Professor</option>
          <option value="admin">Administrador</option>
        </select>
        <button className="btn btn-primary btn-lg w-100">
          Criar minha conta
        </button>
      </form>
    </AuthShell>
  );
}

function Verify({ email, onDone, onBack }) {
  const [address, setAddress] = useState(email);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function submit(e) {
    e.preventDefault();
    try {
      await api.verify({ email: address, codigo: code });
      onDone();
    } catch (err) {
      setError(err.message);
    }
  }
  async function resend() {
    try {
      await api.requestCode(address);
      setSuccess("Novo código enviado.");
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <AuthShell>
      <button className="btn btn-link px-0 mb-3" onClick={onBack}>
        <i className="bi bi-arrow-left me-2" />
        Voltar
      </button>
      <div className="text-center mb-4">
        <div className="welcome-icon">
          <i className="bi bi-envelope-check" />
        </div>
        <h1 className="h3 fw-bold mt-3">Verifique seu e-mail</h1>
        <p className="text-secondary">
          Enviamos um código para <strong>{address || "seu e-mail"}</strong>.
        </p>
      </div>
      <Notice message={error} />
      <Notice message={success} success />
      <form onSubmit={submit}>
        {!email && (
          <Field
            label="E-mail"
            type="email"
            value={address}
            onChange={setAddress}
            placeholder="voce@exemplo.com"
          />
        )}
        <Field
          label="Código de 6 dígitos"
          value={code}
          onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
        />
        <button
          className="btn btn-primary btn-lg w-100"
          disabled={code.length !== 6}
        >
          Confirmar e-mail
        </button>
      </form>
      <p className="text-center mt-4 mb-0 small">
        Não recebeu?{" "}
        <button className="btn btn-link p-0" onClick={resend}>
          Reenviar código
        </button>
      </p>
    </AuthShell>
  );
}

function AdminTools({ token, onMessage }) {
  const [users, setUsers] = useState([]);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepMessage, setCepMessage] = useState("");
  const [address, setAddress] = useState({
    rua: "",
    numero: "",
    cidade: "",
    estado: "",
    cep: "",
    complemento: "",
  });
  const [student, setStudent] = useState({
    nome: "",
    dataNascimento: "",
    usuarioId: "",
  });

  useEffect(() => {
    api
      .users(token)
      .then((items) => setUsers(items.filter((item) => item.role === "aluno")))
      .catch((err) => onMessage(err.message));
  }, [token, onMessage]);

  async function fillAddressFromCep() {
    const cep = address.cep.replace(/\D/g, "");
    setCepMessage("");
    if (cep.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) {
        throw new Error("Não foi possível consultar o CEP.");
      }

      const result = await response.json();
      if (result.erro) {
        setCepMessage("CEP não encontrado. Preencha o endereço manualmente.");
        return;
      }

      setAddress((current) => ({
        ...current,
        cep: result.cep || current.cep,
        rua: result.logradouro || current.rua,
        cidade: result.localidade || current.cidade,
        estado: result.uf || current.estado,
      }));
      setCepMessage("Endereço preenchido pelo ViaCEP.");
    } catch (_error) {
      setCepMessage("Não foi possível consultar o CEP. Preencha manualmente.");
    } finally {
      setCepLoading(false);
    }
  }

  async function createStudentAndAddress(event) {
    event.preventDefault();
    try {
      const createdAddress = await api.createAddress(token, address);
      await api.createStudent(token, {
        ...student,
        usuarioId: Number(student.usuarioId),
        enderecoId: Number(createdAddress.id),
      });
      onMessage("Aluno e endereço cadastrados com sucesso.");
      setAddress({
        rua: "",
        numero: "",
        cidade: "",
        estado: "",
        cep: "",
        complemento: "",
      });
      setStudent({ nome: "", dataNascimento: "", usuarioId: "" });
    } catch (err) {
      onMessage(err.message);
    }
  }

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="feature-card">
          <h3 className="h5 fw-bold">
            <i className="bi bi-person-plus me-2 text-primary" />
            Aluno e endereço
          </h3>
          <p className="text-secondary small">Preencha os dados abaixo.</p>
          <form onSubmit={createStudentAndAddress}>
            <div className="row">
              <div className="col-md-6">
                <Field
                  label="Nome completo"
                  value={student.nome}
                  onChange={(v) => setStudent({ ...student, nome: v })}
                />
                <Field
                  label="Data de nascimento"
                  type="date"
                  value={student.dataNascimento}
                  onChange={(v) =>
                    setStudent({ ...student, dataNascimento: v })
                  }
                />
                <label className="form-label fw-semibold small">Usuário</label>
                <select
                  className="form-select form-select-lg mb-3"
                  value={student.usuarioId}
                  onChange={(e) =>
                    setStudent({ ...student, usuarioId: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione o aluno</option>
                  {users.map((user) => (
                    <option value={user.id} key={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <Field
                  label="Rua"
                  value={address.rua}
                  onChange={(v) => setAddress({ ...address, rua: v })}
                />
                <div className="row">
                  <div className="col-5">
                    <Field
                      label="Número"
                      value={address.numero}
                      onChange={(v) => setAddress({ ...address, numero: v })}
                    />
                  </div>
                  <div className="col-7">
                    <Field
                      label="CEP"
                      value={address.cep}
                      onChange={(v) =>
                        setAddress({ ...address, cep: v.replace(/\D/g, "").slice(0, 8) })
                      }
                      placeholder="00000-000"
                      onBlur={fillAddressFromCep}
                    />
                    {cepLoading && (
                      <div className="form-text text-primary mb-3">
                        <span className="spinner-border spinner-border-sm me-2" />
                        Consultando CEP...
                      </div>
                    )}
                    {cepMessage && (
                      <div className={`form-text mb-3 ${cepMessage.startsWith("Endereço") ? "text-success" : "text-warning"}`}>
                        {cepMessage}
                      </div>
                    )}
                  </div>
                </div>
                <Field
                  label="Cidade"
                  value={address.cidade}
                  onChange={(v) => setAddress({ ...address, cidade: v })}
                />
                <Field
                  label="Estado"
                  value={address.estado}
                  onChange={(v) => setAddress({ ...address, estado: v })}
                />
              </div>
            </div>
            <button className="btn btn-primary">Cadastrar aluno</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ session, onLogout }) {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const role =
    session.role === "admin"
      ? "Administrador"
      : session.role === "professor"
        ? "Professor"
        : "Aluno";
  useEffect(() => {
    if (session.role !== "aluno")
      api
        .students(session.token)
        .then(setStudents)
        .catch((err) => setError(err.message));
  }, [session]);
  return (
    <div className="dashboard-page">
      <nav className="navbar bg-white border-bottom">
        <div className="container">
          <Brand />
          <div className="d-flex align-items-center gap-3">
            <span className="small text-secondary">
              {role} · {session.email}
            </span>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={onLogout}
            >
              Sair
            </button>
          </div>
        </div>
      </nav>
      <main className="container py-5">
        <div className="hero-panel p-4 p-md-5 mb-4">
          <div>
            <span className="badge bg-light text-primary mb-3">
              PAINEL {role.toUpperCase()}
            </span>
            <h1 className="display-6 fw-bold">Olá, seja bem-vindo! 👋</h1>
            <p className="mb-0 opacity-75">
              Gerencie sua jornada no gt-school.
            </p>
          </div>
        </div>
        <Notice message={error} />
        <h2 className="h5 fw-bold mb-3">Recursos disponíveis</h2>
        {session.role === "admin" ? (
          <AdminTools token={session.token} onMessage={setError} />
        ) : (
          <div className="row g-3">
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-people" />
                </div>
                <h3 className="h6 fw-bold mt-3">Alunos</h3>
                <p className="text-secondary small">
                  {students.length} aluno(s) cadastrados.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-journal-check" />
                </div>
                <h3 className="h6 fw-bold mt-3">Avaliações</h3>
                <p className="text-secondary small">
                  Acompanhe avaliações e desempenho.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-mortarboard" />
                </div>
                <h3 className="h6 fw-bold mt-3">Turmas</h3>
                <p className="text-secondary small">
                  Organize turmas e disciplinas.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("login");
  const [email, setEmail] = useState("");
  const [session, setSession] = useState(() =>
    JSON.parse(localStorage.getItem("gt-school-session") || "null"),
  );
  if (session)
    return (
      <Dashboard
        session={session}
        onLogout={() => {
          localStorage.removeItem("gt-school-session");
          setSession(null);
        }}
      />
    );
  if (screen === "register")
    return (
      <Register
        onBack={() => setScreen("login")}
        onCreated={(value) => {
          setEmail(value);
          setScreen("verify");
        }}
      />
    );
  if (screen === "verify")
    return (
      <Verify
        email={email}
        onBack={() => setScreen("login")}
        onDone={() => setScreen("login")}
      />
    );
  return (
    <Login
      onRegister={() => setScreen("register")}
      onVerify={() => {
        setEmail("");
        setScreen("verify");
      }}
      onLogin={(token, value) => {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const next = { token, email: value, role: payload.role };
        localStorage.setItem("gt-school-session", JSON.stringify(next));
        setSession(next);
      }}
    />
  );
}
