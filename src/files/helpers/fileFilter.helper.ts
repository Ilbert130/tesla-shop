import { Request } from "express";


//Cuando el callback regresa falso, no estamos acceptando el archivo. 
//cuando regresa true si lo hacemos 
export const fileFilter = (req:Request, file:Express.Multer.File, callback: Function) => {

    // console.log({file});
    if(!file) return callback(new Error('File is empty'), false);
    
    //el mimetype nos dice el que tipo de archivo es
    const fileExptension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if(validExtensions.includes(fileExptension)){
        return callback(null, true);
    }

    callback(null, false);
}