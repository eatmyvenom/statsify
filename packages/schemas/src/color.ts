import { minecraftColors as colors } from '@statsify/util';
import { Field } from './metadata';

export type ColorCode = typeof colors[number]['code'];

export type ColorHex = typeof colors[number]['hex'];

/**
 * The name of the color in all caps
 */
export type ColorId = typeof colors[number]['id'];

export class Color {
  @Field({
    docs: {
      enum: colors.map((c) => c.code),
      enumName: 'ColorCode',
      examples: [colors[0].code],
      description: 'A Minecraft color code',
    },
    type: () => String,
  })
  public code: ColorCode;

  @Field({
    docs: {
      enum: colors.map((c) => c.hex),
      enumName: 'ColorHex',
      examples: [colors[0].hex],
      description: 'A hex color code',
    },
    type: () => String,
  })
  public hex: ColorHex;

  @Field({
    docs: {
      enum: colors.map((c) => c.id),
      enumName: 'ColorId',
      examples: [colors[0].id],
      description: 'A name of a Minecraft color',
    },
    type: () => String,
  })
  public id: ColorId;

  public constructor(code: ColorCode | ColorHex | ColorId) {
    const color = colors.find((c) => c.code === code || c.hex === code || c.id === code)!;

    this.code = color?.code;
    this.hex = color?.hex;
    this.id = color?.id;
  }

  public toString() {
    return this.code;
  }
}
