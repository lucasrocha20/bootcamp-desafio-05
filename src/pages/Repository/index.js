import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import { Loading, Owner, IssueList, Button } from './styles';
import Container from '../../components/Container';

class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    selectValue: 'all',
    page: 1,
    lastPage: false,
  };

  async componentDidMount() {
    const { match } = this.props;

    const { selectValue, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: selectValue,
          per_page: 5,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleChange = async e => {
    this.setState({
      loading: true,
    });

    await this.setState({ selectValue: e.target.value, page: 1 });

    this.loadIssues();

    this.setState({
      loading: false,
    });
  };

  loadIssues = async () => {
    const { selectValue, page } = this.state;
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: selectValue,
        per_page: 5,
        page,
      },
    });

    if (!(response.headers.link && response.headers.link.includes('next'))) {
      this.setState({
        lastPage: true,
      });
    } else {
      this.setState({
        lastPage: false,
      });
    }

    this.setState({
      issues: response.data,
      loading: false,
    });
  };

  handlePage = async action => {
    const { page } = this.state;

    await this.setState({
      page: action === 'back' ? page - 1 : page + 1,
    });

    this.loadIssues();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      selectValue,
      page,
      lastPage,
    } = this.state;

    if (loading) {
      return <Loading>Carregando...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
          <select defaultValue={selectValue} onChange={this.handleChange}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </Owner>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Button>
          <button
            type="button"
            disabled={page === 1}
            onClick={() => this.handlePage('back')}
          >
            Voltar
          </button>
          <span>Página {page}</span>
          <button
            type="button"
            disabled={lastPage}
            onClick={() => this.handlePage('next')}
          >
            Avançar
          </button>
        </Button>
      </Container>
    );
  }
}

export default Repository;
