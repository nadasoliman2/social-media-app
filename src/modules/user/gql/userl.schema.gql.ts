 import {GraphQLNonNull,GraphQLSchema,GraphQLObjectType,GraphQLString} from "graphql"
import * as UserGQLTypes from './user.types.gql.js'
import * as UserGQLArgs from './user.args.gql.js'
import {userResolver} from './user.resolver.js'

export class UserGQLSchema {
  private userresolver:userResolver;
    constructor(){
this.userresolver = userResolver
    }
    registerQuery(){
  return {
    profile:{
      type: UserGQLTypes.profile,
      args: UserGQLArgs.profile,
      resolve: this.userresolver.profile
    }
  }
}
    
      registerMutation(){
      return  {
          like:{
                       type:GraphQLString,
    
                      resolve:async()=>{
                       
                        return `hi nada `
                      }
                    }
    }}
}
export const userGQLSchema =new UserGQLSchema()