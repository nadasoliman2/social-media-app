import {DatabaseRepository} from "./database.repository.js";
import { INotification } from "../../common/interfaces/index.js";
import {NotificationModel} from '../model/notification.model.js'

export class NotificationRepository extends DatabaseRepository<INotification>{
constructor(){
    super(NotificationModel)
}


}