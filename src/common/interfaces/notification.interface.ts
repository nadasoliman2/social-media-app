import {Types} from"mongoose"
export interface INotification{
     recipient:Types.ObjectId;
     
    
      actor:Types.ObjectId;
       
        comment?:Types.ObjectId;
     
    
      type:number;
        
     
    
      post?: Types.ObjectId;
    
     
    
      reactType?: Number;
     
    
      isRead:  Boolean;
       
     
}