import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { Transaction } from "sequelize";
import { PostInstance } from "../../../models/PostModel";
import { userInfo } from "os";

export const postResolvers = {

    Post: {
        author: (post, args, {db}: {db: DbConnection}, info : GraphQLResolveInfo) => {
            return db.User
                .findById(post.get('author'))
                .then((user) => {
                    if (!user) throw Error(`User with id ${post.get('author')} not found`);
                    return user
                })
        },

        comments: (post, {first = 10, offset = 0}, {db}: {db: DbConnection}, info : GraphQLResolveInfo) => {
            return db.Comment
                .findAll({
                    where: {post: post.get('id')},
                    limit: first,
                    offset: offset
                })
        }
    },
    
    Query: {
        posts: (parent, {first = 10, offset = 0}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.Post
                .findAll({
                    limit: first,
                    offset: offset
                });
        },

        post: (partent, {id}, {db}, {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.Post
                .findById(id)
                .then((post) => {
                    if (!post) throw Error(`Post with id ${id} not found`);
                    return post
                })
        }
    },

    Mutation: {
        createPost: (parent, {input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .create(input, {transaction: t})
            })
        },

        updatePost: (parent, {id, input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findById(id)
                    .then((post: PostInstance) => {
                        if(!post) throw Error(`Post with id ${id} not found`);
                        return post.update(input, {transaction: t});
                    });
            })
        },

        deletePost: (parent, {id}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findById(id)
                    .then((post: PostInstance) => {
                        if(!post) throw Error(`Post with id ${id} not found`);
                        return post.destroy({transaction: t})
                            .then((post) => {
                                return true
                            });
                    });
            })
        }
    }

};