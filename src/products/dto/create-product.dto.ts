import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";


export class CreateProductDto {

    @IsString()
    @MinLength(1)
    title:string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?:number;

    @IsString()
    @IsOptional()
    description?:string;

    @IsString()
    @IsOptional()
    slug?:string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?:number;

    @IsString({each:true})          //Cada elemento del arreglo
    @IsArray()
    sizes:string[];

    //Su valor tiene que estar dentro de este arreglo. Ser uno de estos
    @IsIn(['men','women','kid','unisex'])
    gender:string;
}