import fs, { readFile } from 'fs/promises';
import path from 'path';

// class ImageHandler {
//     static removeImageIfExists = async (imagePath: string): Promise<void> => {
//         try {
//             await fs.access(imagePath); 
//             await fs.unlink(imagePath); 
//         } catch (error) {
//             if (error instanceof Error) {
//                 console.error(`Image not found or error deleting: ${imagePath} - Error: ${error.message}`);
//             } else {
//                 console.error("Unexpected error while deleting image:", error);
//             }
//         }
//     }
//     static doesImageExist = async (imagePath: string): Promise<boolean> => {
//         try {
//             await fs.access(imagePath);
//             return true;
//         } catch {
//             return false;
//         }
//     }
//     static convertToBase64 = async (imagePath: string): Promise<string | null> => {
//         try {
//             const imageBuffer = await readFile(imagePath);
//             return imageBuffer.toString('base64');
//         } catch (error) {
//             console.error('Error converting image to Base64:', error);
//             return null;
//         }
//     }
//     static removePathIfExists = async (targetPath: string): Promise<void> => {
//         try {
//           const stats = await fs.stat(targetPath);
      
//           if (stats.isFile()) {
//             await fs.unlink(targetPath); 
//           } else if (stats.isDirectory()) {
//             await fs.rm(targetPath, { recursive: true, force: true });
//           }
      
//         } catch (error) {
//           if (error instanceof Error) {
//             console.log(`Path not found or error deleting: ${targetPath} - Error: ${error.message}`);
//           } else {
//             console.error("Unexpected error while deleting path:", error);
//           }
//         }
//       };
// }

// export default ImageHandler;


class ImageHandler {
  // Convierte ruta relativa (ej: "shipping-orders/1/file.png") a ruta absoluta en disco
  static resolveImagePath = (relativePath: string): string => {
    return path.join(process.cwd(), 'uploads', relativePath);
  };

  static removeImageIfExists = async (relativePath: string): Promise<void> => {
    const imagePath = ImageHandler.resolveImagePath(relativePath);
    try {
      await fs.access(imagePath);
      await fs.unlink(imagePath);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Image not found or error deleting: ${imagePath} - Error: ${error.message}`);
      } else {
        console.error("Unexpected error while deleting image:", error);
      }
    }
  };

  static doesImageExist = async (relativePath: string): Promise<boolean> => {
    const imagePath = ImageHandler.resolveImagePath(relativePath);
    try {
      await fs.access(imagePath);
      return true;
    } catch {
      return false;
    }
  };

  static convertToBase64 = async (relativePath: string): Promise<string | null> => {
    const imagePath = ImageHandler.resolveImagePath(relativePath);
    console.log(relativePath);
    console.log(imagePath);
    try {
      const imageBuffer = await fs.readFile(imagePath);
      return imageBuffer.toString('base64');
    } catch (error) {
      console.error('Error converting image to Base64:', error);
      return null;
    }
  };

  static removePathIfExists = async (relativePath: string): Promise<void> => {
    const targetPath = ImageHandler.resolveImagePath(relativePath);
    try {
      const stats = await fs.stat(targetPath);

      if (stats.isFile()) {
        await fs.unlink(targetPath);
      } else if (stats.isDirectory()) {
        await fs.rm(targetPath, { recursive: true, force: true });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Path not found or error deleting: ${targetPath} - Error: ${error.message}`);
      } else {
        console.error("Unexpected error while deleting path:", error);
      }
    }
  };
}

export default ImageHandler;

