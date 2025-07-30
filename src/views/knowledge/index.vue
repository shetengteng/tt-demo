<template>
  <div class="knowledge-container" v-if="isMounted">
    <!-- 使用Splitter实现可拖拽分隔面板 -->
    <el-splitter style="height: 100%">
      <!-- 知识库列表面板 -->
      <el-splitter-panel :min="200" :max="350" size="250px">
        <KnowledgeList />
      </el-splitter-panel>

      <!-- 知识库内容主区域面板 -->
      <el-splitter-panel>
        <KnowledgeContent />
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import KnowledgeList from './KnowledgeList.vue'
import KnowledgeContent from './KnowledgeContent.vue'

// 响应式数据
const isMounted = ref(false)

onMounted(async () => {
  isMounted.value = true
})
</script>

<style scoped>
.knowledge-container {
  height: 100%;
  display: flex;
  position: relative;
  overflow: hidden;
}

/* 自定义分隔条样式 */
:deep(.el-splitter__bar) {
  background-color: var(--border-color, #e0e0e0);
}

:deep(.el-splitter__bar:hover) {
  background-color: var(--secondary-text-color, #999);
}
</style>
