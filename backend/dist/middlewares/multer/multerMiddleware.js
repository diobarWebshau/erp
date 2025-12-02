import path from 'path';
import upload from '../../utils/multer/multer.js';
// const uploadImageMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   upload.single('photo')(req, res, async (err: any) => {
//     if (err) {
//       return next(err);
//     }
//     if (!req.file) {
//       return next();
//     }
//     try {
//       const imageUrl = `${req.file.destination}\\${req.file.filename}`;
//       req.body.photo = imageUrl;
//       next();
//     } catch (error) {
//       next(error);
//     }
//   });
// };
const uploadImageMiddleware = async (req, res, next) => {
    try {
        const handleUpload = () => {
            return new Promise((resolve, reject) => {
                upload.fields([
                    { name: 'photo', maxCount: 1 },
                    { name: 'load_evidence', maxCount: 50 }
                ])(req, res, (err) => {
                    console.log("entro a multer");
                    console.log(req.body);
                    console.log(`dsda`, req.files);
                    if (err)
                        return reject(err);
                    // 📂 Ruta base para archivos estáticos
                    const baseUploadFolder = path.resolve(process.cwd(), 'uploads');
                    // Procesar 'photo'
                    if (req.files && 'photo' in req.files) {
                        const file = req.files.photo[0];
                        const relativePath = path.relative(baseUploadFolder, file.path);
                        req.body.photo = relativePath.replace(/\\/g, '/'); // normaliza para frontend
                    }
                    // Procesar 'load_evidence'
                    if (req.files && 'load_evidence' in req.files) {
                        const files = req.files.load_evidence;
                        console.log(files);
                        req.body.load_evidence = files.map((file) => {
                            const relativePath = path.relative(baseUploadFolder, file.path);
                            const normalizedPath = relativePath.replace(/\\/g, '/');
                            return {
                                path: normalizedPath,
                                id: normalizedPath // puedes usar un ID real si lo tienes
                            };
                        });
                    }
                    resolve();
                });
            });
        };
        await handleUpload();
        console.log('salgo de multer');
        next();
    }
    catch (error) {
        next(error);
    }
};
// const uploadImageMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const handleUpload = (): Promise<void> => {
//       return new Promise((resolve, reject) => {
//         upload.fields([
//           { name: 'photo', maxCount: 1 },
//           { name: 'load_evidence', maxCount: 10 }
//         ])(req, res, (err: any) => {
//           if (err) return reject(err);
//           // Procesar 'photo'
//           if (req.files && 'photo' in req.files) {
//             const file = (req.files as any).photo[0];
//             req.body.photo = `${file.destination}\\${file.filename}`;
//           }
//           // Procesar 'load_evidence'
//           console.log("entro a load_evidence");
//           console.log(req.files);
//           if (req.files && 'load_evidence' in req.files) {
//             const files = (req.files as any).load_evidence;
//             req.body.load_evidence = files.map((file: Express.Multer.File) => ({
//               path: `${file.destination}\\${file.filename}`,
//               originalname: file.originalname
//             }));
//           }
//           resolve();
//         });
//       });
//     };
//     await handleUpload();
//     next();
//   } catch (error) {
//     next(error);
//   }
// };
export default uploadImageMiddleware;
