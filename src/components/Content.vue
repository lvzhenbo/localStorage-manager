<template>
  <NLayout content-style="height: 25rem;min-width: 45rem;">
    <NLayoutHeader class="z-10">
      <div class="p-4 flex">
        <div class="mr-10">
          <NButton strong secondary circle type="primary" @click="handleTypeChange">
            {{ type === 'local' ? 'L' : 'S' }}
          </NButton>
        </div>
        <NSpace>
          <NButton type="primary" @click="handleAdd"> 添加 </NButton>
          <NButton @click="getStorage"> 刷新 </NButton>
          <n-popconfirm @positive-click="handleClear">
            <template #trigger>
              <NButton> 删除全部 </NButton>
            </template>
            确定删除全部？
          </n-popconfirm>
        </NSpace>
      </div>
    </NLayoutHeader>
    <NLayout position="absolute" class="!top-[66px]" :native-scrollbar="false">
      <NLayoutContent>
        <div class="p-4">
          <NDataTable :columns="createColumns()" :data="data" :loading="loading" />
          <NDrawer v-model:show="active" width="100%">
            <NDrawerContent closable :native-scrollbar="false" :title="title">
              <NCode :code="code" language="javascript" word-wrap />
            </NDrawerContent>
          </NDrawer>
        </div>
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<script setup lang="tsx">
  import {
    NInput,
    NButton,
    NIcon,
    NSpace,
    NPopconfirm,
    NForm,
    NFormItem,
    type FormInst,
  } from 'naive-ui';
  import { destr } from 'destr';
  import type { DataTableColumns } from 'naive-ui';
  import { DeleteOutlined, CodeOutlined } from '@vicons/antd';

  type RowData = {
    key: string;
    value: string;
  };

  const dialog = useDialog();
  const createColumns = (): DataTableColumns<RowData> => [
    {
      title: 'Key',
      key: 'Key',
      render(row, index) {
        return (
          <NInput
            v-model:value={row.key}
            onBlur={async () => {
              const id = await getTabId();
              if (id) {
                await sendMessage(id, {
                  method: 'setKey',
                  type: type.value,
                  value: {
                    index,
                    key: row.key,
                  },
                });
              }
            }}
          />
        );
      },
    },
    {
      title: 'Value',
      key: 'value',
      render(row, index) {
        return (
          <NInput
            v-model:value={row.value}
            onBlur={async () => {
              const id = await getTabId();
              if (id) {
                await sendMessage(id, {
                  method: 'setValue',
                  type: type.value,
                  value: {
                    index,
                    value: row.value,
                  },
                });
              }
            }}
          />
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      render(row, index) {
        return (
          <NSpace>
            <NPopconfirm
              onPositiveClick={async () => {
                const id = await getTabId();
                if (id) {
                  await sendMessage(id, {
                    method: 'remove',
                    type: type.value,
                    value: row.key,
                  });
                  data.value.splice(index, 1);
                }
              }}
              v-slots={{
                trigger: () => (
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
                ),
              }}
            >
              确定删除？
            </NPopconfirm>
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
              onClick={() => {
                title.value = data.value[index].key;
                code.value = JSON.stringify(destr(data.value[index].value), null, '\t');
                active.value = true;
              }}
            ></NButton>
          </NSpace>
        );
      },
    },
  ];
  const type = ref('local');
  const data = ref<RowData[]>([]);
  const loading = ref(false);
  const active = ref(false);
  const code = ref('');
  const title = ref('');
  const addForm = ref({
    key: '',
    value: '',
  });
  const formRef = ref<FormInst>();
  const rules = {
    key: [
      {
        required: true,
        message: '请输入key',
      },
    ],
    value: [
      {
        required: true,
        message: '请输入value',
      },
    ],
  };

  onMounted(() => {
    getStorage();
  });

  async function getTabId() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      return tab.id;
    }
    return null;
  }

  async function sendMessage(id: number, msg: any) {
    const response = await chrome.tabs.sendMessage(id, msg);
    return response;
  }

  async function getStorage() {
    try {
      loading.value = true;
      const id = await getTabId();
      if (id) {
        const response = await sendMessage(id, { method: 'get', type: type.value });
        data.value = response;
      } else {
        data.value = [];
        return;
      }
      loading.value = false;
    } catch (error) {
      loading.value = false;
      console.error(error);
    }
  }

  function handleTypeChange() {
    type.value = type.value === 'local' ? 'session' : 'local';
    getStorage();
  }

  async function handleClear() {
    const id = await getTabId();
    if (id) {
      await sendMessage(id, { method: 'clear', type: type.value });
      data.value = [];
    } else {
      return;
    }
  }

  async function handleAdd() {
    const id = await getTabId();
    if (!id) {
      return;
    }
    addForm.value = {
      key: '',
      value: '',
    };
    dialog.create({
      title: '添加',
      content: () => (
        <NForm
          inline
          label-placement="left"
          require-mark-placement="left"
          ref={formRef}
          rules={rules}
          model={addForm.value}
        >
          <NFormItem label="key" required path="key">
            <NInput v-model:value={addForm.value.key} placeholder="key" />
          </NFormItem>
          <NFormItem label="value" required path="value">
            <NInput v-model:value={addForm.value.value} placeholder="value" />
          </NFormItem>
        </NForm>
      ),
      positiveText: '确定',
      onPositiveClick: async () => {
        let result = true;
        await formRef.value?.validate(async (errors) => {
          if (!errors) {
            const id = await getTabId();
            if (id) {
              await sendMessage(id, {
                method: 'set',
                type: type.value,
                value: { ...addForm.value },
              });
              getStorage();
            }
          } else {
            result = false;
          }
        });
        return result;
      },
    });
  }
</script>

<style scoped></style>
