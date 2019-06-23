import { commentMudations } from './resources/comment/comment.schema';
import { postMutations } from './resources/post/post.schema';
import { userMutations } from './resources/user/user.schema'

const Mutation: string = `
    type Mutation {
        ${commentMudations}
        ${postMutations}
        ${userMutations}
    }
`;

export {
    Mutation
}
