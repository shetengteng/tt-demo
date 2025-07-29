<template>
  <el-menu-item :index="knowledgeBase.id" class="knowledge-item">
    <div class="knowledge-item-content">
      <div class="knowledge-info">
        <div class="knowledge-name">{{ knowledgeBase.name }}</div>
        <div class="knowledge-meta">
          <span>{{ knowledgeBase.fileCount }} 个文件</span>
          <span>{{ knowledgeBase.lastUpdated }}</span>
        </div>
      </div>
      <div class="knowledge-actions">
        <el-dropdown @command="handleKnowledgeAction" trigger="click" @click.stop>
          <span class="el-dropdown-link">
            <i :class="getIconClass('dots')" class="menu-dots"></i>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="`edit-${knowledgeBase.id}`">
                <i :class="getIconClass('edit')" class="menu-icon"></i>
                <span>编辑</span>
              </el-dropdown-item>
              <el-dropdown-item :command="`delete-${knowledgeBase.id}`" divided>
                <i :class="getIconClass('delete')" class="menu-icon delete-icon"></i>
                <span class="delete-text">删除</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-menu-item>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { useIcon } from '@/composables/useIcon'
import {
  updateKnowledgeBase,
  deleteKnowledgeBase as deleteKnowledgeBaseFromDb,
} from '@/database'

const { getIconClass } = useIcon()

// Props
const props = defineProps({
  knowledgeBase: {
    type: Object,
    required: true,
  },
})

// Emits
const emit = defineEmits(['knowledge-action', 'update-knowledge-base'])

// 方法
const handleKnowledgeAction = async command => {
  const [action, id] = command.split('-')

  if (action === 'edit') {
    await editKnowledgeBase(id)
  } else if (action === 'delete') {
    await deleteKnowledgeBaseHandler(id)
  }
}

const editKnowledgeBase = async (id) => {
  try {
    const { value: form } = await ElMessageBox.prompt('请输入新的知识库名称', '编辑知识库', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '知识库名称不能为空',
      inputValue: props.knowledgeBase.name,
    })

    if (form) {
      const success = await updateKnowledgeBase(parseInt(id), {
        name: form,
        description: props.knowledgeBase.description,
      })

      if (success) {
        ElMessage.success('知识库更新成功')
        // 通知父组件更新知识库
        emit('update-knowledge-base')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新知识库失败:', error)
      ElMessage.error('更新知识库失败')
    }
  }
}

const deleteKnowledgeBaseHandler = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个知识库吗？删除后无法恢复。', '删除知识库', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await deleteKnowledgeBaseFromDb(parseInt(id))
    if (success) {
      ElMessage.success('知识库删除成功')
      // 通知父组件更新知识库列表
      emit('update-knowledge-base')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除知识库失败:', error)
      ElMessage.error('删除知识库失败')
    }
  }
}
</script>

<style scoped>
.knowledge-item {
  margin: 0 10px 5px 10px;
  border-radius: 8px;
  height: auto;
  min-height: 60px;
  padding: 12px 16px;
}

.knowledge-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10px;
}

.knowledge-info {
  flex: 1;
  min-width: 0;
  /* 防止文本溢出 */
}

.knowledge-name {
  font-weight: 500;
  color: var(--text-color, #333);
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.knowledge-meta {
  font-size: 12px;
  color: var(--secondary-text-color, #999);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  line-height: 1.3;
}

.knowledge-actions {
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.knowledge-item:hover .knowledge-actions {
  opacity: 1;
}

.menu-dots {
  font-size: 18px;
  padding: 4px;
  cursor: pointer;
}

.menu-icon {
  margin-right: 6px;
  font-size: 14px;
}

.delete-text {
  color: #ff4d4f;
}

.delete-icon {
  color: #ff4d4f;
}

/* 被选中状态的颜色改为淡灰色 */
:deep(.knowledge-item.is-active) {
  background-color: var(--selected-bg-color, #d3d3d3) !important;
  color: var(--selected-text-color, #333) !important;
}

:deep(.knowledge-item.is-active .knowledge-name),
:deep(.knowledge-item.is-active .knowledge-meta) {
  color: var(--selected-text-color, #333) !important;
}

:deep(.knowledge-item.is-active .menu-dots) {
  color: var(--selected-text-color, #333) !important;
}
</style>
