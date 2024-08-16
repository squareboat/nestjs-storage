import { Module, DynamicModule, Provider, Type } from '@nestjs/common';
import { StorageService } from './storage.service';
import {
  StorageOptions,
  StorageAsyncOptions,
  StorageOptionsFactory,
} from './interfaces';
import { map } from './provider.map';

@Module({})
export class StorageModule {
  static register(options: StorageOptions): DynamicModule {
    return {
      global: true,
      module: StorageModule,
      providers: [
        StorageService,
        {
          provide: map.STORAGE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [StorageService],
    };
  }

  static registerAsync(options: StorageAsyncOptions): DynamicModule {
    return {
      global: true,
      module: StorageModule,
      imports: options.imports || [], // Let the consumer decide the imports
      providers: [
        this.createStorageOptionsProvider(options),
        StorageService,
      ],
      exports: [StorageService],
    };
  }

  private static createStorageOptionsProvider(
    options: StorageAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: map.STORAGE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<StorageOptions>,
    ];

    return {
      provide: map.STORAGE_OPTIONS,
      useFactory: async (optionsFactory: StorageOptionsFactory) =>
        await optionsFactory.createStorageOptions(),
      inject,
    };
  }
}
