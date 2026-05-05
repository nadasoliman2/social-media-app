import {DatabaseRepository} from "./database.repository.js";
import { IUser } from "../../common/interfaces/index.js";
import {UserModel} from '../model/user.model.js'
export class UserRepository extends DatabaseRepository<IUser>{
constructor(){
    super(UserModel)
}


}