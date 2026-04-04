<script setup lang="ts">
import type { EchartsUIType } from '@vben/plugins/echarts';

import { Page } from '@vben/common-ui';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { SystemProShell } from '#/components/system-pro';

import { Card, Descriptions, DescriptionsItem, Divider } from 'antdv-next';
import { computed, nextTick, ref, watch } from 'vue';

import { getCacheInfo } from '#/api';

const loading = ref(false);
const cache = ref<any>(null);

const chartCmdRef = ref<EchartsUIType>();
const chartMemRef = ref<EchartsUIType>();
const { renderEcharts: renderCmd } = useEcharts(chartCmdRef);
const { renderEcharts: renderMem } = useEcharts(chartMemRef);

async function fetchInfo() {
  loading.value = true;
  try {
    cache.value = await getCacheInfo();
    await nextTick();
    renderCharts();
  } finally {
    loading.value = false;
  }
}

const info = computed(() => cache.value?.info || {});

function renderCharts() {
  const cmdStats = cache.value?.commandStats as { name: string; value: number }[] | undefined;
  if (cmdStats?.length && chartCmdRef.value) {
    const top = [...cmdStats].sort((a, b) => b.value - a.value).slice(0, 14);
    renderCmd({
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['35%', '70%'],
          data: top.map((s) => ({ name: s.name, value: s.value })),
        },
      ],
    });
  }

  const used = Number.parseInt(String(info.value.used_memory || '0'), 10) || 0;
  const max = Number.parseInt(String(info.value.maxmemory || '0'), 10) || 0;
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
  if (chartMemRef.value) {
    renderMem({
      series: [
        {
          type: 'gauge',
          min: 0,
          max: 100,
          detail: { formatter: '{value}%' },
          data: [{ value: pct, name: max > 0 ? '内存占用' : '内存(无上限)' }],
        },
      ],
    });
  }
}

watch(
  () => cache.value,
  () => {
    requestAnimationFrame(() => renderCharts());
  },
  { deep: true },
);

fetchInfo();
</script>

<template>
  <Page auto-content-height>
    <SystemProShell table-title="缓存监控" :show-search="false" :show-column-setting="false" @refresh="fetchInfo">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="基本信息" :loading="loading">
        <Descriptions bordered :column="2">
          <DescriptionsItem label="Redis版本">{{ info.redis_version }}</DescriptionsItem>
          <DescriptionsItem label="运行模式">
            {{ info.redis_mode === 'standalone' ? '单机' : info.redis_mode }}
          </DescriptionsItem>
          <DescriptionsItem label="端口">{{ info.tcp_port }}</DescriptionsItem>
          <DescriptionsItem label="客户端数">{{ info.connected_clients }}</DescriptionsItem>
          <DescriptionsItem label="运行时间(天)">{{ info.uptime_in_days }}</DescriptionsItem>
          <DescriptionsItem label="使用内存">{{ info.used_memory_human }}</DescriptionsItem>
          <DescriptionsItem label="内存配置">{{ info.maxmemory_human }}</DescriptionsItem>
          <DescriptionsItem label="Key数量">{{ cache?.dbSize }}</DescriptionsItem>
          <DescriptionsItem label="网络入口/出口">
            {{ info.instantaneous_input_kbps }}kps / {{ info.instantaneous_output_kbps }}kps
          </DescriptionsItem>
          <DescriptionsItem label="AOF是否开启">{{ info.aof_enabled === '0' ? '否' : '是' }}</DescriptionsItem>
          <DescriptionsItem label="RDB是否成功">{{ info.rdb_last_bgsave_status }}</DescriptionsItem>
          <DescriptionsItem label="CPU(子进程)">{{ Number(info.used_cpu_user_children || 0).toFixed(2) }}</DescriptionsItem>
        </Descriptions>
      </Card>
      <Card title="内存占用（估算）" :loading="loading">
        <EchartsUI ref="chartMemRef" class="h-[320px] w-full" />
        <Divider />
        <div class="text-xs text-gray-500">
          未配置 maxmemory 时占比为 0。配置后可反映已用内存与上限的大致比例。
        </div>
      </Card>
      <Card class="lg:col-span-2" title="命令统计（Top）" :loading="loading">
        <EchartsUI ref="chartCmdRef" class="h-[360px] w-full" />
      </Card>
    </div>
    </SystemProShell>
  </Page>
</template>
