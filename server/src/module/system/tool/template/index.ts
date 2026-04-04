import { controllerTem } from './nestjs/controller';
import { dtoTem } from './nestjs/dto';
import { entityTem } from './nestjs/entity';
import { moduleTem } from './nestjs/module';
import { serviceTem } from './nestjs/service';
import { apiVbenTemplate } from './vue/api-vben';
import { indexVbenVue } from './vue/index-vben.vue';

const templates = {
  'tool/template/nestjs/entity.ts.vm': entityTem,
  'tool/template/nestjs/dto.ts.vm': dtoTem,
  'tool/template/nestjs/controller.ts.vm': controllerTem,
  'tool/template/nestjs/service.ts.vm': serviceTem,
  'tool/template/nestjs/module.ts.vm': moduleTem,
  'tool/template/vben/api.ts.vm': apiVbenTemplate,
  'tool/template/vben/index.vue.vm': indexVbenVue,
};

export const index = (options) => {
  const result = {};
  for (const [path, templateFunc] of Object.entries(templates)) {
    result[path] = templateFunc(options);
  }
  return result;
};
