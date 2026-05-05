import {DatabaseRepository} from "./database.repository.js";
import { IPost } from "../../common/interfaces/index.js";
import {PostModel} from '../model/post.model.js'
export class PostRepository extends DatabaseRepository<IPost>{
constructor(){
    super(PostModel)
}


}