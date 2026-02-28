// server/models/Inventory.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IRequest extends Document {
    user_id:  Schema.Types.ObjectId;
    component_id: Schema.Types.ObjectId;
    available_quantity: number;
    status: string;
}

const requestSchema = new Schema<IRequest>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  available_quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },

  component_id: {
    type: Schema.Types.ObjectId,
    ref: 'Component',
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected','returned'],
    required: true,
    default: 'pending'
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});
 
requestSchema.methods.toJSON = function() {
  const obj = this.toObject();
  // Convert _id to id for easier frontend handling
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
}
const Request =
  mongoose.models.Request ||
  mongoose.model<IRequest>('Request',requestSchema, 'requests');

export default Request;