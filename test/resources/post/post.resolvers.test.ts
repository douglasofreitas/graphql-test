import * as jwt from 'jsonwebtoken';

import { app, chai, db, handleError, expect } from './../../test-utils';
import { UserInstance } from '../../../src/models/UserModel';
import { JWT_SECRET } from '../../../src/utils/utils';
import { PostInstance } from '../../../src/models/PostModel';

describe('Post', () => {

    let token: string;
    let userId: number;
    let postId: number;

    beforeEach(() => {
        return db.Comment.destroy({where: {}})
            .then((rows: number) => db.Post.destroy({where: {}}))
            .then((rows: number) => db.User.destroy({where: {}}))
            .then((rows: number) => {
                return db.User.create(
                    {
                        name: 'Peter',
                        email: 'peter@mail.com',
                        password: '1234'
                    }
                ).then((user: UserInstance) => {
                    userId = user.get('id');
                    const payload = { sub: userId };
                    token = jwt.sign(payload, JWT_SECRET);

                    return db.Post.bulkCreate([
                        {
                            title: 'Title 1',
                            content: 'Content 1',
                            author: userId,
                            photo: 'some_photo'
                        },
                        {
                            title: 'Title 2',
                            content: 'Content 2',
                            author: userId,
                            photo: 'some_photo2'
                        }
                    ]);
                }).then((posts: PostInstance[]) => {
                    postId = posts[0].get('id');
                });
            });
    })

    describe('Queries', () => {

        describe('application/json', () => {

            describe('posts', () => {

                it('should return a list of Posts', () => {
                    
                    let body = {
                        query: `
                            query {
                                posts {
                                    title
                                    content
                                }
                            }
                        `
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const postsList = res.body.data.posts;
                            expect(res.body.data).to.be.an('object');
                            expect(postsList).to.be.an('array').of.length(2);
                            expect(postsList[0]).to.not.have.keys(['id', 'photo']);
                            expect(postsList[0]).to.have.keys(['title', 'content']);
                        }).catch(handleError);
                });


            });

            describe('post', () => {
                it('should return a single Post with your Author', () => {
                    
                    let body = {
                        query: `
                            query getPost($id: ID!){
                                post(id: $id) {
                                    title
                                    author {
                                        name
                                        email
                                    }
                                    comments {
                                        comment
                                    }
                                }
                            }
                        `,
                        variables: {
                            id: postId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const singlePost = res.body.data.post;
                            expect(res.body.data).to.have.key('post');
                            expect(singlePost).to.be.an('object');
                            expect(singlePost).to.have.keys(['title', 'author', 'comments']);
                        }).catch(handleError);
                });

            });

        });

        describe('application/graphql', () => {
            
            describe('posts', () => {

                it('should return a list of Posts', () => {
                    
                    let query = `
                            query {
                                posts {
                                    title
                                    content
                                }
                            }
                        `;

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/graphql')
                        .send(query)
                        .then(res => {
                            const postsList = res.body.data.posts;
                            expect(res.body.data).to.be.an('object');
                            expect(postsList).to.be.an('array').of.length(2);
                            expect(postsList[0]).to.not.have.keys(['id', 'photo']);
                            expect(postsList[0]).to.have.keys(['title', 'content']);
                        }).catch(handleError);
                });

                it('should paginate a list of Posts', () => {
                    
                    let query = `
                            query getPostsList($first: Int, $offset: Int) {
                                posts(first: $first, offset: $offset) {
                                    title
                                    content
                                    photo
                                }
                            }
                        `;

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/graphql')
                        .send(query)
                        .query({
                            variables: JSON.stringify({
                                first: 2,
                                offset: 1
                            })
                        })
                        .then(res => {
                            const postsList = res.body.data.posts;
                            expect(res.body.data).to.be.an('object');
                            expect(postsList).to.be.an('array').of.length(1);
                            expect(postsList[0]).to.not.have.keys(['id']);
                            expect(postsList[0]).to.have.keys(['title', 'content', 'photo']);
                        }).catch(handleError);
                });

            });

        });

    });

});