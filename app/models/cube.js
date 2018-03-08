import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CubeSchema = new Schema({
  face: {
      1: {
        type: [Number],
        default: [1, 1, 1, 1, 1, 1, 1, 1, 1]
      },
      2: {
        type: [Number],
        default: [2, 2, 2, 2, 2, 2, 2, 2, 2]
      },
      3: {
        type: [Number],
        default: [3, 3, 3, 3, 3, 3, 3, 3, 3]
      },
      4: {
        type: [Number],
        default: [4, 4, 4, 4, 4, 4, 4, 4, 4]
      },
      5: {
        type: [Number],
        default: [5, 5, 5, 5, 5, 5, 5, 5, 5]
      },
      6: {
        type: [Number],
        default: [6, 6, 6, 6, 6, 6, 6, 6, 6]
      }
    },
  horizontal: {
    type: [Number],
    default: [1, 2, 3, 4]
  },
  vertical: {
    type: [Number],
    default: [1, 6, 3, 5]
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

export default mongoose.model('Cube', CubeSchema);