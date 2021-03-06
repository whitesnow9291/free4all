import React from 'react';
import { Link } from 'react-router';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import { handleSignup } from '../../modules/signup';

export class Signup extends React.Component {
  componentDidMount() {
    handleSignup({ component: this });
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    return <Grid>
      <Row>
        <Col xs={ 12 } sm={ 6 } md={ 4 }>
          <h4 className="page-header">Sign Up</h4>
          <form ref="signup" className="signup" onSubmit={ this.handleSubmit }>
            <Row>
              <Col xs={ 12 } sm={ 12 }>
                <FormGroup>
                  <ControlLabel>First Name</ControlLabel>
                  <FormControl
                    type="text"
                    ref="name"
                    name="name"
                    placeholder="Name"
                  />
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <ControlLabel>Email Address</ControlLabel>
              <FormControl
                type="text"
                ref="emailAddress"
                name="emailAddress"
                placeholder="Email Address"
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Password</ControlLabel>
              <FormControl
                type="password"
                ref="password"
                name="password"
                placeholder="Password"
              />
            </FormGroup>
            <Button type="submit" bsStyle="success">Sign Up</Button>
          </form>
          <p>Already have an account? <a href="javascript:void(0);" onTouchTap={ () => this.context.store.dispatch({ type: 'OPEN_LOGIN_DIALOG' }) }>Log In</a>.</p>
        </Col>
      </Row>
    </Grid>;
  }
}

Signup.contextTypes = {
  store: React.PropTypes.object
};
