// // multerConfig.ts
// import multer, { StorageEngine } from 'multer';
// import path from 'path';
// import { Request } from 'express';
// import fs from 'fs';
// console.log(__dirname);
// // Función para verificar y crear la carpeta si no existe
// const ensureUploadDirectoryExists = (directory: string) => {
//   const uploadDir = path.join(__dirname, directory);
//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }
// };
// // Configuración de Multer para almacenar la imagen en una carpeta local
// const storage: StorageEngine = multer.diskStorage({
//   destination: (req: Request, file: Express.Multer.File, cb: Function) => {
//     // Aquí defines la carpeta donde se almacenarán las imágenes
//     cb(null, 'uploads/images/');
//   },
//   filename: (req: Request, file: Express.Multer.File, cb: Function) => {
//     // Definir un nombre único para la imagen utilizando la fecha actual y la extensión
//     const fileExtension = path.extname(file.originalname);
//     const uniqueName = Date.now() + fileExtension;
//     cb(null, uniqueName);
//   }
// });
// // Filtro para aceptar solo imágenes (jpg, jpeg, png)
// const fileFilter = (req: Request, file: Express.Multer.File, cb: Function): void => {
//   const allowedTypes = /jpeg|jpg|png/;
//   const mimeType = allowedTypes.test(file.mimetype);
//   if (mimeType) {
//     return cb(null, true);
//   } else {
//     return cb(new Error('Only image files are allowed'), false);
//   }
// };
// // Crear el middleware de Multer
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 } // Limitar tamaño de archivo a 5MB
// });
// export default upload;
/*
import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Obtener __dirname en módulos ESM
const rootDir = path.resolve();
console.log(rootDir);

// Interfaz para definir los modelos y las rutas de almacenamiento
interface StorageRoute {
  model: string;
  directory: string;
}

// Array para almacenar las rutas de almacenamiento validadas
const storageRoutes: Array<StorageRoute> = [];
const baseUploadDir = "uploads";
const modelDirectories = ["inputs", "products", "shipping-orders"];

function createUploadDirectories() {
  modelDirectories.forEach((model) => {
    // Usar path.join para manejar las rutas de forma correcta
    const uploadDir = path.join(rootDir, baseUploadDir, model);
    // console.log(`Checking if directory exists: ${uploadDir}`);

    // Verificar si la carpeta ya está registrada
    if (!storageRoutes.find(route => route.model === model)) {
      storageRoutes.push({
        model,
        directory: uploadDir,
      });
    }
    // Si la carpeta no existe, crearla
    if (!fs.existsSync(uploadDir)) {
      try {
        // console.log(`Creating directory: ${uploadDir}`);
        fs.mkdirSync(uploadDir, { recursive: true });
        // console.log(`Directory created: ${uploadDir}`);
      } catch (error) {
        console.error(`Error creating directory ${uploadDir}:`, error);
      }
    } else {
      // console.log(`Directory already exists: ${uploadDir}`);
    }
  });
}

// Llamada a la función para asegurar que las carpetas estén creadas al cargar la configuración
createUploadDirectories();

// Configuración de Multer para almacenar archivos en las carpetas locales
const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function) => {
    const url = req.originalUrl.toLowerCase();
  
    const matchedRoute = storageRoutes.find(({ model }) => {
      const pattern = new RegExp(`/${model}(/|$)`); // eete regex busca el pratron seguido de un slash o que sea el final de la cadena
      return pattern.test(url); // se evalua si la cadena cumple con el patron
    });
  
    const saveDirectory = matchedRoute ? matchedRoute.directory : baseUploadDir;
    cb(null, saveDirectory);
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    // Generar un nombre único para el archivo utilizando la fecha actual y la extensión
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = Date.now() + fileExtension;
    cb(null, uniqueFileName);
  },
});

// Filtro para permitir solo imágenes (jpg, jpeg, png)
const fileFilter = (req: Request, file: Express.Multer.File, cb: Function): void => {
  const allowedFileTypes = /jpeg|jpg|png/;
  const isValidMimeType = allowedFileTypes.test(file.mimetype);

  if (isValidMimeType) {
    return cb(null, true);
  } else {
    return cb(new Error('Only image files (jpeg, jpg, png) are allowed'), false);
  }
};

// Crear el middleware de Multer con las configuraciones definidas
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limitar el tamaño de archivo a 5MB
});

export default upload;
*/
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
// Obtener el directorio raíz del proyecto
const rootDir = path.resolve();
const storageRoutes = [];
const baseUploadDir = 'uploads';
const modelDirectories = ['inputs', 'products', 'shipping-orders'];
// Crear directorios base
function createUploadDirectories() {
    modelDirectories.forEach((model) => {
        const uploadDir = path.join(rootDir, baseUploadDir, model);
        if (!storageRoutes.find((route) => route.model === model)) {
            storageRoutes.push({ model, directory: uploadDir });
        }
        if (!fs.existsSync(uploadDir)) {
            try {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            catch (error) {
                console.error(`Error creating directory ${uploadDir}:`, error);
            }
        }
    });
}
createUploadDirectories();
// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const url = req.originalUrl.toLowerCase();
        // console.log(url);
        const matchedRoute = storageRoutes.find(({ model }) => {
            const pattern = new RegExp(`/${model}(/|$)`);
            return pattern.test(url);
        });
        // console.log(matchedRoute);
        let saveDirectory = matchedRoute ? matchedRoute.directory : baseUploadDir;
        // Crear subdirectorio por ID si es shipping-orders
        if (matchedRoute?.model === 'shipping-orders' && req.params.id) {
            const shippingId = req.params.id;
            const shippingSubdir = path.join(saveDirectory, shippingId);
            if (!fs.existsSync(shippingSubdir)) {
                try {
                    fs.mkdirSync(shippingSubdir, { recursive: true });
                }
                catch (err) {
                    return cb(new Error(`Error creating directory for shipping_order_id ${shippingId}`), null);
                }
            }
            return cb(null, shippingSubdir);
        }
        // Otros modelos
        cb(null, saveDirectory);
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);
        const uniqueFileName = `${randomUUID()}${Date.now()}${fileExtension}`;
        cb(null, uniqueFileName);
    }
});
// Filtro de archivos: solo imágenes permitidas
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|tiff|x-icon|svg\+xml|heic|heif|avif/;
    const isValid = allowedTypes.test(file.mimetype);
    if (isValid) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files (jpeg, jpg, png) are allowed'), false);
    }
};
// Middleware de Multer exportado
const upload = multer({
    storage,
    fileFilter,
    limits: { fieldSize: 10 * 1024 * 1024 },
});
export default upload;
