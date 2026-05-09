
import {UpdateWithAggregationPipeline,
    ReturnsNewDoc,
    populateOptions,
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
      options?: QueryOptions<TRawDoc> & {lean?:true} | null | undefined
    }):Promise<  null | FlattenMaps<TRawDoc>>;
async findOne({filter,projection,options}:
    {
  filter?: QueryFilter<TRawDoc>,
      projection?: ProjectionType<TRawDoc> | null | undefined,
      options?: QueryOptions<TRawDoc> & mongodb.Abortable | null | undefined
    }):Promise<HydratedDocument<TRawDoc> | null | FlattenMaps<TRawDoc>>{
 const doc =  this.model.findOne(filter,projection)
 if(options?.lean) doc.lean(options.lean)
    if(options?.populate){
    doc.populate(options.populate as any)
  }
    return await doc.exec()
}

async find({
  filter,
  projection,
  options
}: {
  filter?: QueryFilter<TRawDoc>,
  projection?: ProjectionType<TRawDoc> | null,
  options?: QueryOptions<TRawDoc> | null
}): Promise<HydratedDocument<TRawDoc>[]> {

  const doc = this.model.find(filter || {}, projection, options)

  if (options?.populate) {
    doc.populate(options.populate as any)
  }

  if (options?.lean) {
    doc.lean()
  }
  if(options?.limit) doc.limit(options.limit)
    if(options?.skip) doc.skip(options.skip)

  return await doc.exec()
}
async paginate({
  filter,
  projection,
  options={},
  page=0,
  size=5
}: {
  filter?: QueryFilter<TRawDoc>,
  projection?: ProjectionType<TRawDoc> | null,
  options?: QueryOptions<TRawDoc>
  page?: number| string | undefined,
  size?: number| string | undefined
}): Promise<{docs: HydratedDocument<TRawDoc>[],currentPage?:number,size?:number,pages?:number}> {
let count:number = -1
  if(Number(page) > 0 ){
    page =parseInt(page as string);
        size =parseInt(size as string);
          options.skip=(page - 1) * size;
options.limit=size;
count = await this.model.countDocuments(filter || {})
  }
const docs = await this.find({
  filter: filter || {},
  projection: projection ?? null,
  options
})

return {
  docs,
  ...(Number(page) > 0
    ? {
        currentPage: Number(page),
        size: Number(size),
        pages: Math.ceil(count / Number(size))
      }
    : {})
}
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

async findOneAndUpdate({
  filter,
  update,
  options = { new: true },
  populate=[]
}: {
  filter: QueryFilter<TRawDoc>,
  update: UpdateQuery<TRawDoc> | any[],
  options?: QueryOptions<TRawDoc> & ReturnsNewDoc,
  populate?:populateOptions[]
}): Promise<HydratedDocument<TRawDoc> | null> {

  // PIPELINE MODE
  if (Array.isArray(update)) {
    return await this.model.findOneAndUpdate(
      filter,
      [
        ...update,
        {
          $set: {
            __v: { $add: ["$__v", 1] }
          }
        }
      ],
      {
        ...options,
        updatePipeline: true
      }
    );
  }

  // NORMAL MODE
  return await this.model.findOneAndUpdate(
    filter,
    {
      ...update,
      $inc: { __v: 1 }
    },
    options
  );
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
async countDocuments(filter: QueryFilter<TRawDoc> = {}): Promise<number> {
  return await this.model.countDocuments(filter)
}
async aggregate(pipeline: any[]) {
  return await this.model.aggregate(pipeline)
}
}