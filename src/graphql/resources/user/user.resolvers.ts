import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";

import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { AuthUser } from "../../../interfaces/AuthUserInterface"
import { UserInstance } from "../../../models/UserModel";
import { handleError, throwError } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolver, authResolvers } from "../../composable/auth.resolver";
import { verifyTokenResolver } from "../../composable/verify-token.resolver";
import { RequestedFields } from "../../ast/RequestedFields";
import { ResolverContext } from "../../../interfaces/ResolverContextInterface";


//resolver parameters
//parent, args, context, info

export const userResolvers = {

    User: {
        posts: (user: UserInstance, { first = 10, offset = 0 }, {db, requestedFields}: {db: DbConnection, requestedFields: RequestedFields}, info: GraphQLResolveInfo) => {
            return db.Post
                .findAll({
                    where: { author: user.get('id') },
                    limit: first,
                    offset: offset,
                    attributes: requestedFields.getFields(info, {keep: ['id'], exclude: ['comments']})
                })
                .catch(handleError);
        }
    },

    Query: {
        
        users: (parent, { first = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
            return context.db.User
                .findAll({
                    limit: first,
                    offset: offset,
                    attributes: context.requestedFields.getFields(info, {keep: ['id'], exclude: ['posts']})
                })
                .catch(handleError);
        },

        user: (parent, {id}, context: ResolverContext, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return context.db.User
                .findById(id, {
                    attributes: context.requestedFields.getFields(info, {keep: ['id'], exclude: ['posts']})
                })
                .then((user: UserInstance) => {
                    throwError(!user, `User with id ${id} not found`);
                    return user;
                }).catch(handleError);
                
        },

        currentUser: compose(...authResolvers)((parent, args, context: ResolverContext, info: GraphQLResolveInfo) => {
            return context.db.User
                .findById(context.authUser.id, {
                    attributes: context.requestedFields.getFields(info, {keep: ['id'], exclude: ['posts']})
                })
                .then((user: UserInstance) => {
                    throwError(!user, `User with id ${context.authUser.id} not found`);
                    return user;
                }).catch(handleError)
        })
    },

    Mutation: {
        createUser: (parent, {input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .create(input, { transaction: t });
            }).catch(handleError);
        },

        updateUser: compose(...authResolvers)((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        //if(!user) throw Error(`User with id ${id} not found`);
                        throwError(!user, `User with id ${authUser.id} not found`);
                        user.update(input, {transaction: t});
                        return user;
                    })
            }).catch(handleError);
        }),

        updateUserPassword: compose(...authResolvers)((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `User with id ${authUser.id} not found`);
                        user.update(input, {transaction: t})
                            .then((user: UserInstance) => !!user)
                    })
            }).catch(handleError);
        }),

        deleteUser: compose(...authResolvers)((parent, args, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `User with id ${authUser.id} not found`);
                        return user.destroy({transaction: t})
                            .then(user => {
                                //error return void from destroy (this version)
                                return true;
                            });
                    })
            }).catch(handleError);
        })
    }
};