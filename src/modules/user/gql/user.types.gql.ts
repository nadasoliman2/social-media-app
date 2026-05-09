import {GraphQLNonNull , GraphQLObjectType,GraphQLString,GraphQLList, GraphQLID, GraphQLEnumType} from 'graphql'
import { GenderEnum ,ProviderEnum,RoleEnum} from '../../../common/enums/user.enum.js'
export const GenderGQLEnumType = new GraphQLEnumType(
    {
name:"GenderGQLEnumType",
values:{
    Male:{value:GenderEnum.MALE},
    Female:{value:GenderEnum.FEMALE},
}
    }
)
export const ProviderGQLEnumType = new GraphQLEnumType(
    {
name:"ProviderGQLEnumType",
values:{
    Google:{value:ProviderEnum.GOOGLE},
    System:{value:ProviderEnum.SYSTEM},
}
    }
)
export const RoleGQLEnumType = new GraphQLEnumType(
    {
name:"RoleGQLEnumType",
values:{
    Admin:{value:RoleEnum.ADMIN},
    User:{value:RoleEnum.USER},
}
    }
)

                
                export const OneUserType:GraphQLObjectType =new GraphQLObjectType({
                  name:"OneUserType",
                  description:"",
                  fields:() =>({
                                 firstName: {type:new GraphQLNonNull(GraphQLString)},
                                    lastName:{type:new GraphQLNonNull(GraphQLString)},
                                    username:{type:GraphQLString},
                                    email:{type:GraphQLString},
                                    phone:{type:GraphQLString},
                                    password:{type:GraphQLString},
                                    profilepicture:{type:GraphQLString},
                                    profilecoverpicture:{type: new GraphQLList(GraphQLString)},
                                gender:{type:GenderGQLEnumType},
                                role:{type:RoleGQLEnumType},
                                provider:{type:ProviderGQLEnumType},
                                _id:{type: new GraphQLNonNull(GraphQLID)},
                                changeCredentialsTime:{type:GraphQLString},
                                DOB:{type:GraphQLString},
                                confirmEmail:{type:GraphQLString},
                                createdAt:{type: new GraphQLNonNull(GraphQLString)},
                                updatedAt:{type: new GraphQLNonNull(GraphQLString)},
                              
                                deletedAt:{type:GraphQLString},
                                restoredAt:{type:GraphQLString},
friends: {
  type: new GraphQLList(OneUserType)
}                            }
                        )
                
                
                }) 
                export const profile =new GraphQLNonNull(new GraphQLObjectType({
                  name:"ProfileResponse",
                  description:"",
                  fields:{
                    message:{type:new GraphQLNonNull(GraphQLString)},
                    data:{
                        type: OneUserType
                      
                    }
                  }
                }) )
       