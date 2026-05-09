 import {GraphQLNonNull,GraphQLSchema,GraphQLObjectType,GraphQLString} from "graphql"
   import {postGQLSchema} from '../post/index.js'
 import {userGQLSchema} from '../user/index.js'
 const query=new GraphQLObjectType(
      
      {
          name:"RootQuerySchema",
          fields:{
...userGQLSchema.registerQuery(),
...postGQLSchema.registerQuery()
          }
        }
      )
 const  mutation=new GraphQLObjectType(
        {
          name:"RootSchemaMutation",
          fields:{
           ...userGQLSchema.registerMutation()
           , ...postGQLSchema.registerMutation()
          }
        }
      )
 export const schema  = new GraphQLSchema({query,mutation})