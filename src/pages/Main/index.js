import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { Form, SubmitButton, List } from './styles';
import Container from '../../components/Container';
import api from '../../services/api';

class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    status: false,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();

    try {
      const { newRepo, repositories } = this.state;

      this.setState({
        loading: true,
      });

      const repoDuplicate = repositories.find(repository => {
        return repository.name === newRepo;
      });

      // eslint-disable-next-line no-throw-literal
      if (repoDuplicate) throw 'Repositório já existe';

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        status: false,
      });
    } catch (err) {
      console.log(err);

      this.setState({
        loading: false,
        status: true,
      });
    }
  };

  render() {
    const { newRepo, repositories, loading, status } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} status={status}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            onChange={this.handleInputChange}
            value={newRepo}
          />

          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}

export default Main;
