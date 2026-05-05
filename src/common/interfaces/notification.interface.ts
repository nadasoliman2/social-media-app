import {Types} from"mongoose"
export interface INotification{
     recipient:Types.ObjectId;
     
    
      actor:Types.ObjectId;
       
        
     
    
      type:String;
        
     
    
      post: Types.ObjectId;
    
     
    
      reactType: Number;
     
    
      isRead:  Boolean;
       
     
}