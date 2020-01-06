import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { Container, Row, Spinner } from 'reactstrap';
import { loadApp as loadAppAction } from './actions';

class LoadingPage extends PureComponent {
  componentDidMount() {
    const { loadApp, appLoaded } = this.props;
    if (!appLoaded) {
      loadApp();
    }
  }

  render() {
    const { isLoading, appLoaded } = this.props;
    if (!isLoading && appLoaded) {
      return <Redirect to="/dashboard" />;
    }
    return (
      <Container
        className="d-flex justify-content-center align-items-center flex-column"
        style={{ height: '100vh' }}
      >
        <Row>
          <Spinner type="grow" color="primary" />
          <Spinner type="grow" color="secondary" />
          <Spinner type="grow" color="success" />
          <Spinner type="grow" color="danger" />
          <Spinner type="grow" color="warning" />
          <Spinner type="grow" color="info" />
          <Spinner type="grow" color="dark" />
        </Row>
        <Row>Loading Application</Row>
      </Container>
    );
  }
}

LoadingPage.propTypes = {
  loadApp: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  appLoaded: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
  isLoading: state.pages.loading.get('isLoading'),
  appLoaded: state.pages.loading.get('appLoaded')
});

const mapDispatchToProps = {
  loadApp: loadAppAction
};

export default connect(mapStateToProps, mapDispatchToProps)(LoadingPage);
