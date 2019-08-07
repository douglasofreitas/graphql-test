import { app, chai, db, handleError, expect } from './../../test-utils';
import { UserInstance } from '../../../src/models/UserModel';
import { JWT_SECRET } from '../../../src/utils/utils';


describe('Token', () => {
    beforeEach(() => {
        return db.Comment.destroy({where: {}})
            .then((rows: number) => db.Post.destroy({where: {}}))
            .then((rows: number) => db.User.destroy({where: {}}))
            .then((rows: number) => {
                return db.User.create({
                        name: 'Peter',
                        email: 'peter@mail.com',
                        password: '1234'
                    });
            }).catch(handleError);
    });

    describe('Mudations', () => {
        describe('application/json', () => {
            describe('createToken', () => {
                
                it('should return a valid token', () => {
                    
                    let body = {
                        query: `
                            mutation createNewToken($email: String!, $password: String!) {
                                createToken(email: $email, password: $password) {
                                    token
                                }
                            }
                        `,
                        variables: {
                            email: 'peter@mail.com',
                            password: '1234'
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            expect(res.body.data).to.have.key('createToken');
                            expect(res.body.data.createToken).to.have.key('token');
                            expect(res.body.data.createToken.token).to.be.string;
                            expect(res.body.errors).to.be.undefined;
                        }).catch(handleError);

                })

            })
        })        
    })
})