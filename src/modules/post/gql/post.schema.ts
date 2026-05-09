import * as postGQLTypes from './post.types.gql.js'
import * as postGQLArgs from './post.args.gql.js'
import {postResolver,PostResolver} from './post.resolver.js'
export class PostGQLSchema {
    private postresolver:postResolver
        constructor(){
this.postresolver = postResolver
    }
    registerQuery(){
        return{
postList:{
    type:postGQLTypes.postList,
    args:postGQLArgs.postList,
    resolve: this.postresolver.postList
}
        }
    }
   registerMutation(){
    return{
        reactOnPost:{
            type:postGQLTypes.reactOnPost,
            args:postGQLArgs.reactOnPost,
            resolve:this.postresolver.reactOnPost.bind(this.postresolver)
        }
    }
}
}
export const postGQLSchema = new PostGQLSchema()