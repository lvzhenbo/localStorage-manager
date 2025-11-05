<template>
  <NLayout content-style="height: 25rem;min-width: 45rem;">
    <NLayoutHeader class="z-10" bordered position="absolute">
      <div class="p-3 flex">
        <div class="mr-10">
          <NButton
            strong
            secondary
            circle
            type="primary"
            :disabled
            size="small"
            @click="handleTypeChange"
          >
            {{ type === 'local' ? 'L' : 'S' }}
          </NButton>
        </div>
        <NSpace>
          <NButton type="primary" :disabled size="small" @click="handleAdd"> 添加 </NButton>
          <NButton :disabled size="small" @click="getStorage"> 刷新 </NButton>
          <NPopconfirm @positive-click="handleClear">
            <template #trigger>
              <NButton :disabled size="small" type="error"> 删除全部 </NButton>
            </template>
            确定删除全部？
          </NPopconfirm>
          <NUpload
            ref="uploadRef"
            :show-file-list="false"
            accept="application/json"
            :max="1"
            :disabled
            @update:file-list="handleImport"
          >
            <NButton size="small"> 导入 </NButton>
          </NUpload>
          <NButton :disabled size="small" @click="handleExport"> 导出 </NButton>
        </NSpace>
      </div>
    </NLayoutHeader>
    <NLayout position="absolute" class="top-[53px]!" :native-scrollbar="false">
      <NLayoutContent>
        <div v-if="!disabled" class="p-3">
          <NDataTable
            :columns="createColumns()"
            :data="data"
            :loading="loading"
            :max-height="282"
            :min-height="282"
            virtual-scroll
            size="small"
          />
          <NDrawer v-model:show="active" width="100%">
            <NDrawerContent closable :native-scrollbar="false" :title="title">
              <NCode :code="code" language="json" word-wrap show-line-numbers />
            </NDrawerContent>
          </NDrawer>
        </div>
        <div v-else class="p-4">
          <NResult status="error" title="错误" description="页面未加载完毕或不受支持">
            <template #footer> 请尝试重新打开插件或刷新页面 </template>
          </NResult>
        </div>
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<script setup lang="tsx">
  import type { FormInst, UploadFileInfo, UploadInst } from 'naive-ui';
  import { destr } from 'destr';
  import type { DataTableColumns } from 'naive-ui';
  import { DeleteOutlined, CodeOutlined } from '@vicons/antd';

  const dialog = useDialog();
  const message = useMessage();
  const createColumns = (): DataTableColumns<RowData> => [
    {
      title: 'Key',
      key: 'Key',
      render(row, index) {
        return (
          <NInput
            v-model:value={row.key}
            size="small"
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
            size="small"
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
      width: 80,
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
                const item = data.value[index];
                if (item) {
                  title.value = item.key;
                  code.value = JSON.stringify(destr(item.value), null, 2);
                  active.value = true;
                }
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
  const disabled = ref(false);
  const uploadRef = ref<UploadInst>();

  onMounted(() => {
    getStorage();
  });

  async function getTabId() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
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
      disabled.value = true;
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

  function handleImport(fileList: UploadFileInfo[]) {
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') {
        return;
      }
      const data: OutputFile = JSON.parse(reader.result);
      if (data.fileId) {
        if (data.fileId === 'localStorageManager') {
          const id = await getTabId();
          if (id) {
            if (data.local && data.session) {
              await sendMessage(id, {
                method: 'import',
                type: 'import',
                value: data,
              });
              getStorage();
              message.success('导入成功');
            } else {
              importError();
            }
          }
        } else {
          importError();
        }
      } else {
        importError();
      }
      uploadRef.value?.clear();
    };
    const firstFile = fileList[0];
    if (firstFile?.file) {
      reader.readAsText(firstFile.file);
    }
  }

  function importError() {
    message.error('文件格式错误，请检查文件是否为本插件导出的文件');
  }

  async function handleExport() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab?.id && tab.url) {
      const url = new URL(tab.url);
      const response = await sendMessage(tab.id, { method: 'export', type: 'export' });
      const blob = new Blob([JSON.stringify(response)], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${url.hostname}-${new Date().getTime()}.json`;
      a.click();
      URL.revokeObjectURL(blobUrl);
      message.success('导出成功');
    }
  }
</script>

<style scoped></style>
