<script lang="ts" setup>
import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router';

import { unref } from 'vue';
import { RouterView } from 'vue-router';

import { usePreferences } from '@vben/preferences';
import { getTabKey, storeToRefs, useTabbarStore } from '@vben/stores';

import { transformComponent, useLayoutHook } from '../../hooks';
import { IFrameRouterView } from '../../iframe';
import { RouteCachedPage, RouteCachedView } from '../../route-cached';

defineOptions({ name: 'LayoutContent' });

const tabbarStore = useTabbarStore();
const { keepAlive } = usePreferences();

const { getCachedTabs, getExcludeCachedTabs, renderRouteView } =
  storeToRefs(tabbarStore);

const { getEnabledTransition, getTransitionName } = useLayoutHook();

/**
 * 是否显示component
 * @param route
 */
const showComponent = (route: RouteLocationNormalizedLoadedGeneric) => {
  return !route.meta.domCached && unref(renderRouteView);
};

/** 路由切换或懒加载首屏时 Component 可能短暂为 null，仍渲染会触发 patch parentNode null */
const canRenderPage = (
  route: RouteLocationNormalizedLoadedGeneric,
  Component: unknown,
) => showComponent(route) && !!Component;
</script>

<template>
  <div class="relative h-full">
    <IFrameRouterView />
    <RouteCachedView />
    <RouterView v-slot="{ Component, route }">
      <RouteCachedPage
        :component="Component"
        :route="route"
        v-if="route.meta.domCached"
      />
      <Transition
        v-if="getEnabledTransition"
        :name="getTransitionName(route)"
        appear
        mode="out-in"
      >
        <KeepAlive
          v-if="keepAlive"
          :exclude="getExcludeCachedTabs"
          :include="getCachedTabs"
        >
          <component
            :is="transformComponent(Component, route)"
            v-if="canRenderPage(route, Component)"
            v-show="!route.meta.iframeSrc"
            :key="getTabKey(route)"
          />
        </KeepAlive>
        <component
          :is="Component"
          v-else-if="canRenderPage(route, Component)"
          :key="getTabKey(route)"
        />
      </Transition>
      <template v-else>
        <KeepAlive
          v-if="keepAlive"
          :exclude="getExcludeCachedTabs"
          :include="getCachedTabs"
        >
          <component
            :is="transformComponent(Component, route)"
            v-if="canRenderPage(route, Component)"
            v-show="!route.meta.iframeSrc"
            :key="getTabKey(route)"
          />
        </KeepAlive>
        <component
          :is="Component"
          v-else-if="canRenderPage(route, Component)"
          :key="getTabKey(route)"
        />
      </template>
    </RouterView>
  </div>
</template>
