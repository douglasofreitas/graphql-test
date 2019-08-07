import * as jwt from 'jsonwebtoken';

import { app, chai, db, handleError, expect } from './../../test-utils';
import { UserInstance } from '../../../src/models/UserModel';
import { JWT_SECRET } from '../../../src/utils/utils';
import { PostInstance } from '../../../src/models/PostModel';

describe('Comment', () => {

    let token: string;
    let userId: number;
    let postId: number;
    let commentId: number;

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

                    return db.Post.create(
                        {
                            title: 'Title 1',
                            content: 'Content 1',
                            author: userId,
                            photo: 'some_photo'
                        });
                }).then((post: PostInstance) => {
                    postId = post.get('id');

                    return db.Comment.bulkCreate([
                        {
                            comment: 'First Comment',
                            user: userId,
                            post: postId
                        },
                        {
                            comment: 'Second Comment',
                            user: userId,
                            post: postId
                        }
                    ])
                });
            });
    })

    describe('Queries', () => {

        describe('application/json', () => {

            describe('comments', () => {

                it('should return a list of Comments', () => {
                    
                    let body = {
                        query: `
                            query getCommentsByPostList($postId: ID!, $first: Int, $offset: Int) {
                                commentsByPost(postId: $postId, first: $first, offset: $offset) {
                                    comment
                                    user {
                                        id
                                    }
                                    post{ 
                                        id
                                    }
                                }
                            }
                        `,
                        variables: {
                            postId: postId,
                            first: 2,
                            offset: 1
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const commentsList = res.body.data.commentsByPost;
                            expect(res.body.data).to.be.an('object');
                            expect(commentsList).to.be.an('array');
                            expect(commentsList[0]).to.not.have.keys(['id', 'photo']);
                            expect(commentsList[0]).to.have.keys(['comment', 'user', 'post']);
                        }).catch(handleError);
                });

            });

        });

    });

});