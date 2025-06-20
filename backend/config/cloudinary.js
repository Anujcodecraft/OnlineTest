import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: 'disdfurag',
  api_key: '613593414999372',
  api_secret: 'GWcIsE1-t-HtCHCk83BsNdYoBso',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'testcases',
    resource_type: 'raw', // for txt or zip files
  },
});

export { cloudinary, storage };
