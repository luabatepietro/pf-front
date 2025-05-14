import { useEffect, useState } from 'react';
import './App.css';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const [token, setToken] = useState(null);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('');

  const [artigos, setArtigos] = useState([]);
  const [roles, setRoles] = useState([]);

  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently
  } = useAuth0();

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload['https://musica-insper.com/email'];
      const userRoles = payload['https://musica-insper.com/roles'] || [];
      setRoles(userRoles);

      fetch('http://18.230.75.11:8080/artigos', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }).then(response => response.json())
        .then(data => setArtigos(data))
        .catch(error => alert(error));
    }
  }, [token]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);
      } catch (e) {
        console.error('Erro ao buscar token:', e);
      }
    };

    if (isAuthenticated) {
      fetchToken();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  function salvarartigo() {
    fetch('http://18.230.75.11:8080/artigos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        'titulo': titulo,
        'descricao': descricao,
        'prioridade': prioridade
      })
    }).then(response => response.json())
      .then(() => window.location.reload())
      .catch(error => alert(error));
  }

  function excluirartigo(id) {
    fetch('http://18.230.75.11:8080/artigos/' + id, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(() => window.location.reload())
      .catch(error => alert(error));
  }

  return (
    <>
      <div>
        <div>
          <img src={user.picture} alt={user.name} />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <LogoutButton />
        </div>

        {roles.includes('ADMIN') && (
          <div>
            <h3>Criar artigo</h3>
            Título: <input type='text' onChange={e => setTitulo(e.target.value)} /><br />
            Descrição: <input type='text' onChange={e => setDescricao(e.target.value)} /><br />
            Prioridade: <input type='number' onChange={e => setPrioridade(e.target.value)} /><br />
            <button onClick={salvarartigo}>Cadastrar</button>
          </div>
        )}

        <h3>Lista de artigos</h3>
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Descrição</th>
              <th>Prioridade</th>
              <th>Usuário</th>
              {roles.includes('ADMIN') && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {artigos.map((artigo, index) => (
              <tr key={index}>
                <td>{artigo.titulo}</td>
                <td>{artigo.descricao}</td>
                <td>{artigo.prioridade}</td>
                <td>{artigo.email}</td>
                {roles.includes('ADMIN') && (
                  <td>
                    <button onClick={() => excluirartigo(artigo.id)}>Excluir</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default App;
