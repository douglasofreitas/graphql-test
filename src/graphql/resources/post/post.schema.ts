const postTypes = `
    type POst {
        id: ID!
        title: String!
        content: String!
        photo: String!
        createdAt: String!
        updatedAt: String!
        author: User!
        comments: [Comment!]!
    }

    input PostInput {
        title: String!
        content: String!
        photo: String!
        author: Int!
    }
`;

const postQueries = `
    posts(first: Inst, offset: Inst): [ Post! ]!
    post(id: ID!): Post
`;

const postMutations = `
    createPost(input: POstInput!): Post
    updatePost(id: ID!, input: POstInput!): Post
    deletePost(id: ID!): Boolean
`;

export {
    postTypes,
    postQueries,
    postMutations
}