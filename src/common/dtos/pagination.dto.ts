import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';


export class PaginationDto {

    @ApiProperty({
        default:10,
        description: 'How many rows do you need?'
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number)             //Para hacer convercion a numero
    limit?:number;

    @ApiProperty({
        default:0,
        description: 'Since witch rows'
    })
    @IsOptional()
    @IsPositive()
    @Min(0)
    @Type(() => Number)
    offset?:number;
}