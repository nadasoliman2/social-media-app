
import {UpdateWithAggregationPipeline,
    ReturnsNewDoc,
    MongooseUpdateQueryOptions,
    UpdateQuery, Types,Model, HydratedDocument ,FlattenMaps,CreateOptions, AnyKeys,QueryFilter,ProjectionType,QueryOptions,mongodb} from "mongoose";

export abstract class DatabaseRepository<TRawDoc>{
    constructor(protected readonly model:Model<TRawDoc>){

    }
     async create(
        {data,

        }:{
            data:AnyKeys<TRawDoc>[] , 
        } ):Promise<HydratedDocument<TRawDoc>>;
        async create(
        {data,options

        }:{
            data:AnyKeys<TRawDoc>[], 
            options?: CreateOptions | undefined
        } ):Promise<HydratedDocument<TRawDoc>[] >;
    async create(
        {data,options

        }:{
            data:AnyKeys<TRawDoc>[] | AnyKeys<TRawDoc>, 
            options?: CreateOptions | undefined
        } ):Promise<HydratedDocument<TRawDoc>[] | HydratedDocument<TRawDoc>>{ 
        return await this.model.create(data as any,options)

    }
        async insertMany(
        {data

        }:{
            data:AnyKeys<TRawDoc>[] | AnyKeys<TRawDoc>, 
        } ):Promise<HydratedDocument<TRawDoc>[] >{ 
        return await this.model.insertMany(data as any)  as HydratedDocument<TRawDoc>[]

    }
  async createOne({
  data,
  options
}: {
  data: AnyKeys<TRawDoc>,
  options?: CreateOptions
}): Promise<HydratedDocument<TRawDoc>> {

  const [doc] = await this.create({
    data: [data],
    options
  })  as HydratedDocument<TRawDoc>[];

  if (!doc) {
    throw new Error("Failed to create document");
  }

  return doc;
}
//Find
async findOne({filter,projection,options}:
    {
  filter?: QueryFilter<TRawDoc>,
      projection?: ProjectionType<TRawDoc> | null | undefined,
      options?: QueryOptions<TRawDoc> & {lean:false} | null | undefined
    }):Promise<HydratedDocument<TRawDoc> | null >;

    async findOne({filter,projection,options}:
    {
  filter?: QueryFilter<TRawDoc>,
      projection?: ProjectionType<TRawDoc> | null | undefined,
      options?: QueryOptions<TRawDoc> & {lean:true} | null | undefined
    }):Promise<  null | FlattenMaps<TRawDoc>>;
async findOne({filter,projection,options}:
    {
  filter?: QueryFilter<TRawDoc>,
      projection?: ProjectionType<TRawDoc> | null | undefined,
      options?: QueryOptions<TRawDoc> & mongodb.Abortable | null | undefined
    }):Promise<HydratedDocument<TRawDoc> | null | FlattenMaps<TRawDoc>>{
 const doc =  this.model.findOne(filter,projection)
 if(options?.lean) doc.lean(options.lean)
    if(options?.lean) doc.populate(options.populate as any)
    return await doc.exec()
}


    async findbyid({ _id, projection, options }:
    {
  _id?:Types.ObjectId | string,
      projection?: ProjectionType<TRawDoc> | null | undefined,
      options?: QueryOptions<TRawDoc> & {lean:true} | null | undefined
    }):Promise<  null | FlattenMaps<TRawDoc>>;
async findbyid({ _id, projection, options }:
    {
  _id?:Types.ObjectId | string,
      projection?: ProjectionType<TRawDoc> | null | undefined,
      options?: QueryOptions<TRawDoc> & {lean:true} | null | undefined
    }):Promise<  null | FlattenMaps<TRawDoc>>;
async findbyid({ _id, projection, options }:
    {
  _id?:Types.ObjectId | string,
      projection?: ProjectionType<TRawDoc> | null | undefined,
      options?: QueryOptions<TRawDoc> & mongodb.Abortable | null | undefined
    }):Promise<HydratedDocument<TRawDoc> | null | FlattenMaps<TRawDoc>>{
 const doc =  this.model.findById(_id,projection)
 if(options?.lean) doc.lean(options.lean)
    if(options?.lean) doc.populate(options.populate as any)
    return await doc.exec()
}
async findOneAndUpdate({filter, update, options={new:true}}:{
      filter: QueryFilter<TRawDoc>,
      update: UpdateQuery<TRawDoc>,
      options?: QueryOptions<TRawDoc>& ReturnsNewDoc
}):Promise<HydratedDocument<TRawDoc> | null>{
    return await this.model.findOneAndUpdate(filter, {...update,$inc:{__v:1}}, options)
}
async findByIdAndUpdate({ _id, update, options={new:true} }:{
      _id: Types.ObjectId | string,
      update: UpdateQuery<TRawDoc>,
      options: QueryOptions<TRawDoc>& ReturnsNewDoc
}):Promise<HydratedDocument<TRawDoc> | null>{
    return await this.model.findByIdAndUpdate(_id, {...update,$inc:{__v:1}}, options)
}
async updateOne({filter, update, options}:{
      filter: QueryFilter<TRawDoc>,
          update: UpdateQuery<TRawDoc> | UpdateWithAggregationPipeline,
          options?: (mongodb.UpdateOptions & MongooseUpdateQueryOptions<TRawDoc>) | null
}):Promise<mongodb.UpdateResult>{
    return await this.model.updateOne(filter, {...update,$inc:{__v:1}}, options)
}
async updateMany({filter, update, options}:{
      filter: QueryFilter<TRawDoc>,
          update: UpdateQuery<TRawDoc> | UpdateWithAggregationPipeline,
          options?: (mongodb.UpdateOptions & MongooseUpdateQueryOptions<TRawDoc>) | null
}):Promise<mongodb.UpdateResult>{
    return await this.model.updateMany(filter, {...update,$inc:{__v:1}}, options)
}
async deleteOne({filter}:{
      filter: QueryFilter<TRawDoc>}):Promise<mongodb.DeleteResult>{
    return await this.model.deleteOne(filter)
}
async deleteMany({filter}:{
      filter: QueryFilter<TRawDoc>}):Promise<mongodb.DeleteResult>{
    return await this.model.deleteMany(filter)
}
async findOneAndDelete({filter}:{
      filter: QueryFilter<TRawDoc>,
     
}):Promise<HydratedDocument<TRawDoc> | null>{
    return await this.model.findOneAndDelete(filter)
}
async findByIdAndDelete({_id}:{
      _id: Types.ObjectId | string,
     
}):Promise<HydratedDocument<TRawDoc> | null>{
    return await this.model.findByIdAndDelete(_id)
}
}