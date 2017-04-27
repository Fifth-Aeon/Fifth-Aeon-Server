import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import app from '../src/App';

chai.use(chaiHttp);
const expect = chai.expect;

describe('GET api/v1/heroes', () => {

  it('responds with JSON array', () => {
    return chai.request(app).get('/api/v1/heroes')
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(5);
      });
  });

  it('should include Wolverine', () => {
    return chai.request(app).get('/api/v1/heroes')
      .then(res => {
        let Wolverine = res.body.find(hero => hero.name === 'Wolverine');
        expect(Wolverine).to.exist;
        expect(Wolverine).to.have.all.keys([
          'id',
          'name',
          'aliases',
          'occupation',
          'gender',
          'height',
          'hair',
          'eyes',
          'powers'
        ]);
      });
  });

});