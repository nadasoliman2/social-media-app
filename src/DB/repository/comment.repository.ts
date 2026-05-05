import {DatabaseRepository} from "./database.repository.js";
import { IComment } from "../../common/interfaces/index.js";
import {CommentModel} from '../model/comment.model.js'
export class CommentRepository extends DatabaseRepository<IComment>{
constructor(){
    super(CommentModel)
}


}