<script setup lang="tsx">
  import { zhCN, dateZhCN, NInput, NButton, NIcon, NSpace } from 'naive-ui';
  import type { DataTableColumns } from 'naive-ui';
  import { DeleteOutlined, CodeOutlined } from '@vicons/antd';

  type RowData = {
    key: number;
    Key: string;
    value: string;
  };
  console.log('This is a popup!');
  const type = ref('local');
  const createColumns = (): DataTableColumns<RowData> => [
    {
      title: 'Key',
      key: 'Key',
      render(row) {
        return <NInput value={row.Key} />;
      },
    },
    {
      title: 'Value',
      key: 'value',
      render(row) {
        return <NInput value={row.value} />;
      },
    },
    {
      title: '操作',
      key: 'actions',
      render() {
        return (
          <NSpace>
            <NButton
              text
              type="error"
              v-slots={{
                icon: () => (
                  <NIcon>
                    <DeleteOutlined />
                  </NIcon>
                ),
              }}
            ></NButton>
            <NButton
              text
              type="info"
              v-slots={{
                icon: () => (
                  <NIcon>
                    <CodeOutlined />
                  </NIcon>
                ),
              }}
            ></NButton>
          </NSpace>
        );
      },
    },
  ];
  const data = ref<RowData[]>([
    {
      key: 0,
      Key: 'Key',
      value: 'Value',
    },
  ]);
</script>

<template>
  <NConfigProvider :locale="zhCN" :date-locale="dateZhCN">
    <NLayout content-style="height: 20rem;min-width: 45rem;">
      <NLayoutHeader class="z-10">
        <div class="p-4 flex">
          <div class="mr-10">
            <NButton strong secondary circle type="primary">
              {{ type === 'local' ? 'L' : 'S' }}
            </NButton>
          </div>
          <NSpace>
            <NButton type="primary"> 添加 </NButton>
            <NButton> 刷新 </NButton>
            <NButton> 删除全部 </NButton>
          </NSpace>
        </div>
      </NLayoutHeader>
      <NLayout position="absolute" class="!top-[66px]">
        <NLayoutContent>
          <div class="p-4">
            <NDataTable :columns="createColumns()" :data="data" />
          </div>
        </NLayoutContent>
      </NLayout>
    </NLayout>
  </NConfigProvider>
</template>

<style scoped></style>
