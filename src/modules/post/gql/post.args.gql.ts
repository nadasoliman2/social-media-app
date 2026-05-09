import { GraphQLInt,GraphQLID, GraphQLNonNull, GraphQLString, GraphQLEnumType } from "graphql";

export const postList ={
    page:{type:GraphQLInt},
    size:{type:GraphQLInt},
    search:{type:GraphQLString}

}

export const ReactGQLEnumType = new GraphQLEnumType({
  name: "ReactEnum",
  values: {
    DisLike: { value: 0 },
    Like: { value: 1 }
  }
})
export const reactOnPost = {
  postId: { type: new GraphQLNonNull(GraphQLID) },
  react: { type: ReactGQLEnumType }
}