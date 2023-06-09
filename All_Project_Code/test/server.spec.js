// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        console.log("welcome test case");
        console.log(res.body);
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });

  // ===========================================================================
  // TO-DO: Part A Login unit test case



  //We are checking POST /add_user API by passing the user info in the correct order. This test case should pass and return a status 200 along with a "Success" message.
  //Positive cases
  it('positive : /add_user', done => {
    chai
      .request(server)
      .post('/add_user')
      .send({ StudentID: 2234, first_name: 'Ligma', last_name:'Cabals', pwd:"yes",email:'steveharvey@realsteveharvevy.legit'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('data added successfully');
        done();
      });
  });



//   //We are checking POST /add_user API by passing the user info in in incorrect manner (name cannot be an integer). This test case should pass and return a status 200 along with a "Invalid input" message.
it('Negative : /add_user. Checking invalid name', done => {
  chai
    .request(server)
    .post('/add_user')
    .send({ StudentID: '2234', first_name: 'Ligma', last_name:'Cabals', pwd:"yes",email:'steveharvey@realsteveharvevy.legit'})
    .end((err, res) => {
      expect(res).to.have.status(404);
      expect(res.body.message).to.equals('Invalid input');
      done();
    });
});


it('positive : /register', done => {
  chai
    .request(server)
    .post('/register')
    .send({ StudentID: 9999999, first_name: 'Joseph', last_name:'Cabals', password:"no",email:'philipdistefano@colorado.edu'})
    .end((err, res) => {
      expect(res).to.have.status(200);
      // expect(res.body.message).to.equals('data added successfully');
      done();
    });
});



//We are checking POST /add_user API by passing the user info in in incorrect manner (name cannot be an integer). This test case should pass and return a status 200 along with a "Invalid input" message.
it('Negative : /register. Checking invalid name', done => {
chai
  .request(server)
  .post('/register')
  .send({ StudentID: 1101, first_name: 'Guy', last_name:'Fawkes', password:"london",email:'guyfawkes@colorado.edu'})
  .end((err, res) => {
    expect(res).to.have.status(404);
    // expect(res.body.message).to.equals('Invalid input');
    done();
  });
});

});