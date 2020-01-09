import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import AuthRoute from './AuthRoute';

import LoginPage from './pages/login';
import LoadingPage from './pages/loading';
import DashboardPage from './pages/dashboard';
import RanksPage from './pages/ranks';
import PlatoonsPage from './pages/platoons';
import PointsPage from './pages/points';

const App = () => {
  return (
    <Router>
      <Switch>
        <Redirect from="/" to="/login" exact />
        <Route path="/login" exact component={LoginPage} />
        <AuthRoute path="/app" exact component={LoadingPage} />
        <AuthRoute path="/dashboard" exact component={DashboardPage} />
        <AuthRoute path="/ranks" exact component={RanksPage} />
        <AuthRoute path="/platoons" exact component={PlatoonsPage} />
        <AuthRoute path="/points" exact component={PointsPage} />
      </Switch>
    </Router>
  );
};

export default App;
