import {GraphQLInt, GraphQLEnumType,GraphQLNonNull, GraphQLObjectType, GraphQLString , GraphQLList} from "graphql";
import {OneUserType} from '../../user/gql/user.types.gql.js'
import {AvailabilityEnum} from "../../../common/enums/index.js"
export const AvailabilityGQLEnumType = new GraphQLEnumType({
    name:"AvailabilityEnum",
    values:{
        Public:{value:AvailabilityEnum.PUBLIC},
Friends:{value:AvailabilityEnum.FRIENDS_ONLY},
Private:{value:AvailabilityEnum.PRIVATE}
    }
})

export const OnePostType = new GraphQLObjectType({
    name:"OnePostType",
    fields:{
        _id:{type:new GraphQLNonNull(GraphQLString)},
            folderId:{type:new GraphQLNonNull(GraphQLString)},
            content:{type:GraphQLString},
            attachments:{type: new GraphQLList(GraphQLString)},
            availability:{type:AvailabilityGQLEnumType},
            likes:{type: new GraphQLList(OneUserType)},
            tags:{type: new GraphQLList(OneUserType)},
            createdBy:{type:new GraphQLNonNull(OneUserType)},
            updatedBy:{type: OneUserType},
            deletedAt:{type:GraphQLString},
            restoredAt:{type:GraphQLString},
         createdAt:{type:GraphQLString},
         updatedAt:{type:GraphQLString},

        }
    }
)

export const postList = new GraphQLObjectType({
    name:"PostListResponse",
    fields:{
        message:{type:new GraphQLNonNull(GraphQLString)
        },
        data:{type:new GraphQLObjectType({
            name:"PostPaginationResponse",
            fields:{
                docs:{type:new GraphQLList(OnePostType)},
                  currentPage: {type:GraphQLInt},
                  size: {type:GraphQLInt},
                  pages: {type:GraphQLInt}
            }
        })}
    }
})
export const reactOnPost = new GraphQLObjectType(
    {
        name:"ReactOnPostResponse",
        fields:{
               message:{type:new GraphQLNonNull(GraphQLString)} ,
               data:{type:OnePostType}
            }
    }
)