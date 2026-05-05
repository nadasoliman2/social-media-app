import { HydratedDocument } from "mongoose"
export    interface IPaginate<TRawDoc = any>{
  docs: HydratedDocument<TRawDoc>[];
  currentPage?: number;
  size?: number;
  pages?: number;
}