import type { SubCommandMetadata, SubCommandOptions } from './command.interface';

export function SubCommand(options: SubCommandOptions): MethodDecorator {
  return (target, propertyKey) => {
    const metadata: SubCommandMetadata = {
      ...options,
      name: options.name ?? (propertyKey as string).toLowerCase(),
      methodName: propertyKey as string,
    };

    Reflect.defineMetadata('statsify:subcommand', metadata, target, propertyKey);
  };
}
