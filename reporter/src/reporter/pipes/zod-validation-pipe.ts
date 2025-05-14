import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: any) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(
        result.error.errors.map((err) => err.message).join(', '),
      );
    }

    return result.data;
  }
}
